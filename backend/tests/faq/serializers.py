import os

import pytest
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile

from faq.serializers import (
    DailyTrendSerializer,
    FAQSerializer,
    FAQStatisticsSerializer,
    PdfSerializer,
    QuestionAnswerSerializer,
    ScrapeSerializer,
    ToneSerializer,
)


@pytest.mark.django_db
class TestFAQSerializer:
    def test_qa_desriliazed(self, question_answer):
        data = QuestionAnswerSerializer(question_answer).data

        assert set(data.keys()) == {"answer", "question", "id"}
        assert data["id"] == question_answer.id
        assert data["question"] == question_answer.question
        assert data["answer"] == question_answer.answer

    def test_qa_serialize(self):
        data = {"question": "New Question?", "answer": "New Answer."}
        serialized = QuestionAnswerSerializer(data=data)

        assert serialized.is_valid()

    def test_qa_invalid_set_id(self):
        data = {
            "id": 999,  # Trying to set an ID manually
            "question": "New Question?",
            "answer": "New Answer.",
        }
        serialized = QuestionAnswerSerializer(data=data)
        assert serialized.is_valid()
        validated_data = serialized.validated_data
        assert "id" not in validated_data
        assert set(validated_data.keys()) == set(["answer", "question"])

    def test_qa_required(self):
        """Test required fields in qa."""
        data = {}
        serialized = QuestionAnswerSerializer(data=data)

        assert not serialized.is_valid()
        assert {"question", "answer"} == set(serialized.errors.keys())

    def test_faq_deserialized(self, faq_with_qa):
        """Test deserialzation for faq."""
        data = FAQSerializer(faq_with_qa).data

        assert set(data.keys()) == {
            "id",
            "user",
            "title",
            "content",
            "generated_faqs",
            "number_of_faqs",
            "tone",
            "created_at",
            "updated_at",
        }

    def test_faq_serializer(self, user):
        data = {"user": user, "title": "Test FAQ", "content": "Test content"}

        seriliazer = FAQSerializer(data=data)
        read_only_fields = ["id", "user", "title", "generated_faqs", "created_at", "updated_at"]

        assert seriliazer.is_valid()
        validated_data = seriliazer.validated_data

        assert any(key not in read_only_fields for key in validated_data.keys())
        assert data["content"] == validated_data["content"]

    def test_faq_serializer_required(self, user):
        data = {"user": user}

        seriliazer = FAQSerializer(data=data)

        assert not seriliazer.is_valid()
        assert "content" in seriliazer.errors.keys()

    def test_daily_trend_serializer(self):
        """Test daily trend serialization."""
        data = {"day": "2025-02-22", "count": 5}
        serializer = DailyTrendSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.data == data

    def test_daily_trend_invalid_count(self):
        """Test daily trend with invalid count."""
        data = {"day": "2025-02-22", "count": -1}
        serializer = DailyTrendSerializer(data=data)

        assert not serializer.is_valid()
        assert "count" in serializer.errors

    def test_tone_serializer(self):
        """Test tone distribution serialization."""
        data = {"tone": "formal", "value": 10}
        serializer = ToneSerializer(data=data)

        assert serializer.is_valid()
        assert serializer.data == data

    def test_tone_invalid_value(self):
        """Test tone with invalid value."""
        data = {"tone": "formal", "value": -5}
        serializer = ToneSerializer(data=data)

        assert not serializer.is_valid()
        assert "value" in serializer.errors

    def test_faq_statistics_serializer(self, faq_with_qa):
        """Test FAQ statistics serialization."""
        data = {
            "total_faqs": 10,
            "total_questions": 50,
            "avg_questions_per_faq": 5.0,
            "last_faq_created": FAQSerializer(faq_with_qa).data,
            "daily_trends": [{"day": "2025-02-22", "count": 5}, {"day": "2025-02-21", "count": 3}],
            "tones": [{"tone": "formal", "value": 6}, {"tone": "casual", "value": 4}],
        }

        serializer = FAQStatisticsSerializer(data=data)
        assert serializer.is_valid()

        # Verify nested serializers
        assert len(serializer.data["daily_trends"]) == 2
        assert len(serializer.data["tones"]) == 2

    def test_scrape_serializer(self):
        """Test URL scraping serializer."""
        data = {"url": "https://example.com"}
        serializer = ScrapeSerializer(data=data)

        assert serializer.is_valid()
        assert "content" not in serializer.validated_data

    def test_scrape_invalid_url(self):
        """Test scraping with invalid URL."""
        data = {"url": "not-a-url"}
        serializer = ScrapeSerializer(data=data)

        assert not serializer.is_valid()
        assert "url" in serializer.errors

    def test_pdf_serializer_valid(self):
        """Test PDF serializer with valid file."""
        # Load the real PDF file
        pdf_path = os.path.join(settings.BASE_DIR, "tests/samples/test_pdf_upload.pdf")
        with open(pdf_path, "rb") as pdf_file:
            pdf_data = pdf_file.read()

        # Create a SimpleUploadedFile instance
        pdf_file = SimpleUploadedFile("test_pdf_upload.pdf", pdf_data, content_type="application/pdf")

        serializer = PdfSerializer(data={"file": pdf_file})
        assert serializer.is_valid()

    def test_pdf_serializer_invalid_type(self):
        """Test PDF serializer with wrong file type."""
        text_file = SimpleUploadedFile("test.txt", b"Not a PDF", content_type="text/plain")

        serializer = PdfSerializer(data={"file": text_file})
        assert not serializer.is_valid()
        assert "file" in serializer.errors
        assert "PDF" in str(serializer.errors["file"][0])

    def test_pdf_serializer_empty_file(self):
        """Test PDF serializer with empty file."""
        empty_file = SimpleUploadedFile("empty.pdf", b"", content_type="application/pdf")

        serializer = PdfSerializer(data={"file": empty_file})
        assert not serializer.is_valid()
        assert "empty" in str(serializer.errors["file"][0]).lower()

    def test_pdf_serializer_large_file(self):
        """Test PDF serializer with file exceeding size limit."""
        large_content = b"x" * (11 * 1024 * 1024)  # 11MB
        large_file = SimpleUploadedFile("large.pdf", large_content, content_type="application/pdf")

        serializer = PdfSerializer(data={"file": large_file})
        assert not serializer.is_valid()
        assert "10MB" in str(serializer.errors["file"][0])
