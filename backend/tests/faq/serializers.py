import pytest

from faq.serializers import FAQSerializer, QuestionAnswerSerializer


@pytest.mark.django_db
class TestQuestionAnswerSerializer:
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


@pytest.mark.django_db
class TestFAQSerializer:
    def test_faq_deserialized(self, faq_with_qa):
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
