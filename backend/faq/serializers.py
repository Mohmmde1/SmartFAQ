# faq/serializers.py
from rest_framework import serializers

from .models import FAQ, QuestionAnswer


class QuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAnswer
        fields = ['id', 'question', 'answer']


class FAQSerializer(serializers.ModelSerializer):
    generated_faqs = QuestionAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = FAQ
        fields = ['id', 'user', 'title', 'content', 'generated_faqs', 'created_at', 'updated_at']
        read_only_fields = ['generated_faqs', 'created_at', 'updated_at']
