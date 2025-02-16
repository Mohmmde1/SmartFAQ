
from requests.exceptions import ConnectionError, RequestException
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from urllib3.exceptions import MaxRetryError

from .models import FAQ, QuestionAnswer
from .services import scrape_and_summarize


class QuestionAnswerSerializer(serializers.ModelSerializer):
    """Serializer for FAQ question and answer pairs."""

    class Meta:
        model = QuestionAnswer
        fields = ["id", "question", "answer"]
        read_only_fields = ["id"]


class FAQSerializer(serializers.ModelSerializer):
    """Serializer for FAQ entries with nested questions and answers."""

    generated_faqs = QuestionAnswerSerializer(many=True, read_only=True)
    number_of_faqs = serializers.IntegerField(min_value=1, max_value=20, default=5)
    tone = serializers.ChoiceField(choices=["neutral", "formal", "casual"], default="neutral")

    def validate_content(self, value: str) -> str:
        """Validate content field."""
        if not value.strip():
            raise ValidationError("Content cannot be empty")
        return value.strip()

    class Meta:
        model = FAQ
        fields = [
            "id",
            "user",
            "title",
            "content",
            "generated_faqs",
            "number_of_faqs",
            "tone",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "title", "generated_faqs", "created_at", "updated_at"]


class DailyTrendSerializer(serializers.Serializer):
    day = serializers.CharField()
    count = serializers.IntegerField()


class ToneSerializer(serializers.Serializer):
    tone = serializers.CharField()
    value = serializers.IntegerField()


class FAQStatisticsSerializer(serializers.Serializer):
    total_faqs = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    avg_questions_per_faq = serializers.FloatField()
    last_faq_created = FAQSerializer(read_only=True)
    daily_trends = DailyTrendSerializer(many=True)
    tones = ToneSerializer(many=True)


class ScrapeSerializer(serializers.Serializer):
    """Serializer for URL scraping and content summarization."""
    url = serializers.URLField()
    content = serializers.CharField(read_only=True)

    def get_error_detail(self, message: str, field: str = "non_field_errors"):
        """Standardized method to return validation errors."""
        return ValidationError({field: [message]})

    def create(self, validated_data):
        """Process the URL and return scraped content."""
        try:
            content = scrape_and_summarize(
                validated_data["url"],
                self.context.get("user_email")
            )
            return {"content": content}

        except (ConnectionError, MaxRetryError) as err:
            raise self.get_error_detail(
                "Unable to connect to the provided URL. Please check if the URL is accessible.",
                "url"
            ) from err

        except RequestException as err:
            raise self.get_error_detail(
                "Failed to fetch content from URL. Please try again later.",
                "url"
            ) from err

        except Exception as err:
            raise self.get_error_detail(
                "An unexpected error occurred while processing the URL."
            ) from err
