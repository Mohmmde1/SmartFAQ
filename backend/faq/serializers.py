from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import FAQ, QuestionAnswer


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
