import logging

from pypdf import PdfReader
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import FAQ, QuestionAnswer

logger = logging.getLogger(__name__)


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
    count = serializers.IntegerField(min_value=0)


class ToneSerializer(serializers.Serializer):
    tone = serializers.CharField()
    value = serializers.IntegerField(min_value=0)


class FAQStatisticsSerializer(serializers.Serializer):
    total_faqs = serializers.IntegerField(min_value=0)
    total_questions = serializers.IntegerField(min_value=0)
    avg_questions_per_faq = serializers.FloatField()
    last_faq_created = FAQSerializer(read_only=True)
    daily_trends = DailyTrendSerializer(many=True)
    tones = ToneSerializer(many=True)


class ScrapeSerializer(serializers.Serializer):
    """Serializer for URL scraping and content summarization."""

    url = serializers.URLField()
    content = serializers.CharField(read_only=True)

    class Meta:
        fields = ["url", "content"]


class PdfSerializer(serializers.Serializer):
    """Serializer for PDF to be extracted"""

    file = serializers.FileField(write_only=True)
    content = serializers.CharField(read_only=True)

    def validate_file(self, value):
        """Validate PDF file constraints."""
        if not value or value.size == 0:
            raise ValidationError("PDF file is empty")

        if value.size > 10 * 1024 * 1024:  # 10MB
            raise ValidationError("PDF file size must be less than 10MB")

        if not value.name.endswith(".pdf"):
            raise ValidationError("File must be a PDF")

        try:
            value.seek(0)
            pdf_reader = PdfReader(value)
            if len(pdf_reader.pages) > 50:
                raise ValidationError("PDF must not exceed 50 pages")
            value.seek(0)
            return value
        except Exception as err:
            raise ValidationError(f"Invalid PDF file: {str(err)}") from err
