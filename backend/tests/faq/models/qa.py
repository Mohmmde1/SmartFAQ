import pytest

from faq.models import QuestionAnswer


@pytest.mark.django_db
class TestQuestionAnswerModel:
    def test_qa_creation(self, question_answer):
        """Test creation of a simple QA"""
        assert question_answer.question == "What is SmartFAQ?"
        assert question_answer.answer == "A FAQ generator."
        assert QuestionAnswer.objects.count() == 1

    def test_qa_string_representation(self, question_answer):
        """Test QA string representation."""
        assert str(question_answer) == "What is SmartFAQ?"

    def test_qa_update(self, question_answer):
        """Test updating a QA"""
        question_answer.question = "How does it work?"
        question_answer.answer = "It uses AI."
        question_answer.save()

        assert question_answer.question == "How does it work?"
        assert question_answer.answer == "It uses AI."

    def test_qa_delete(self, question_answer):
        """Test deleting a QA"""
        question_answer.delete()

        assert not QuestionAnswer.objects.exists()

    def test_qa_bulk_create(self):
        """Test bulk creation of QAs"""
        QuestionAnswer.objects.bulk_create(
            [
                QuestionAnswer(question="What is SmartFAQ?", answer="A FAQ generator."),
                QuestionAnswer(question="How does it work?", answer="It uses AI."),
            ]
        )

        assert QuestionAnswer.objects.count() == 2
