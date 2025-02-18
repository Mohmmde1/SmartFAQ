from django.core.cache import cache
from django.db.models import QuerySet

from ..models import FAQ


class StatisticsSelector:
    """Selector for FAQ statistics."""

    @staticmethod
    def get_statistics(queryset: QuerySet[FAQ]) -> dict:
        """Get FAQ statistics from queryset."""
        cache_key = f"faq_stats_{queryset.query.__str__()}"
        stats = cache.get(cache_key)

        if not stats:
            total_faqs = queryset.count()
            total_questions = sum(faq.generated_faqs.count() for faq in queryset)
            avg_questions = total_questions / total_faqs if total_faqs > 0 else 0

            monthly_trends = [
                {"month": item["month"].strftime("%b"), "count": item["count"]}
                for item in FAQ.objects.get_monthly_trends(queryset)
            ]

            daily_trends = [
                {"day": item["day"].strftime("%a"), "count": item["count"]}
                for item in FAQ.objects.get_daily_trends(queryset)
            ]

            tones = [
                {"tone": item["tone"] or "Uncategorized", "value": item["value"]}
                for item in FAQ.objects.get_tone_distribution(queryset)
            ]

            stats = {
                "total_faqs": total_faqs,
                "total_questions": total_questions,
                "avg_questions_per_faq": round(avg_questions, 1),
                "last_faq_created": queryset.first(),
                "monthly_trends": monthly_trends,
                "daily_trends": daily_trends,
                "tones": tones,
            }
            cache.set(cache_key, stats, timeout=3600)  # Cache for 1 hour

        return stats
