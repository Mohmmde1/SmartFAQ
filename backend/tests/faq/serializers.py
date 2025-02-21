import pytest

from faq.serializers import QuestionAnswerSerializer


@pytest.mark.django_db
class TestQuestionAnswerSerializer:
    def test_qa_desriliazed(self, question_answer):
        data = QuestionAnswerSerializer(question_answer).data

        assert set(data.keys()) == set(["answer", "question", "id"])
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
