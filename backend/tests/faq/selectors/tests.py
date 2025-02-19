from unittest.mock import patch

import pytest
from django.core.cache import cache
from freezegun import freeze_time

from faq.models import FAQ
from faq.selectors.statistics_selector import StatisticsSelector


@pytest.mark.django_db
class TestStatisticsSelector:
    @pytest.fixture(autouse=True)
    def setup(self):
        """Clear cache before each test."""
        cache.clear()
        yield
        cache.clear()

    def test_get_statistics_total_counts(self, faq_queryset):
        """Test total FAQ and question counts."""
        result = StatisticsSelector.get_statistics(faq_queryset)

        assert result["total_faqs"] == faq_queryset.count()
        assert result["total_questions"] == sum(faq.generated_faqs.count() for faq in faq_queryset)

    def test_get_statistics_average_questions(self, faq_queryset):
        """Test average questions calculation."""
        result = StatisticsSelector.get_statistics(faq_queryset)

        total_faqs = faq_queryset.count()
        total_questions = sum(faq.generated_faqs.count() for faq in faq_queryset)
        expected_avg = round(total_questions / total_faqs, 1)

        assert result["avg_questions_per_faq"] == expected_avg

    @freeze_time("2025-01-01")
    def test_get_statistics_trends(self, faq_queryset):
        """Test monthly and daily trends with frozen time."""
        result = StatisticsSelector.get_statistics(faq_queryset)

        assert len(result["monthly_trends"]) <= 6  # Last 6 months
        assert len(result["daily_trends"]) <= 7  # Last 7 days

        # Verify trend format
        for trend in result["monthly_trends"]:
            assert set(trend.keys()) == {"month", "count"}
            assert isinstance(trend["count"], int)

        for trend in result["daily_trends"]:
            assert set(trend.keys()) == {"day", "count"}
            assert isinstance(trend["count"], int)

    def test_get_statistics_tone_distribution(self, faq_queryset):
        """Test tone distribution statistics."""
        result = StatisticsSelector.get_statistics(faq_queryset)

        assert isinstance(result["tones"], list)
        total_faqs = sum(tone["value"] for tone in result["tones"])
        assert total_faqs == faq_queryset.count()

    @patch("django.core.cache.cache.get")
    @patch("django.core.cache.cache.set")
    def test_get_statistics_caching(self, mock_cache_set, mock_cache_get, faq_queryset):
        """Test that statistics are properly cached."""
        # First call - cache miss
        mock_cache_get.return_value = None
        first_result = StatisticsSelector.get_statistics(faq_queryset)

        # Verify cache was set
        mock_cache_set.assert_called_once()

        # Second call - cache hit
        mock_cache_get.return_value = first_result
        second_result = StatisticsSelector.get_statistics(faq_queryset)

        # Verify results match and cache was used
        assert first_result == second_result
        assert mock_cache_get.call_count == 2
        assert mock_cache_set.call_count == 1

    @pytest.mark.parametrize("queryset_size", [0, 1, 10])
    def test_get_statistics_with_different_sizes(self, user, queryset_size):
        """Test statistics with different queryset sizes."""
        faqs = [FAQ.objects.create(user=user, title=f"FAQ {i}", content=f"Content {i}") for i in range(queryset_size)]
        queryset = FAQ.objects.filter(id__in=[faq.id for faq in faqs])

        result = StatisticsSelector.get_statistics(queryset)

        assert result["total_faqs"] == queryset_size
        assert result["avg_questions_per_faq"] == 0  # No questions added
