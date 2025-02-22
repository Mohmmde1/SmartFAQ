import pytest

from faq.models import FAQ, QuestionAnswer


@pytest.mark.django_db
class TestFAQModel:
    def test_faq_creation_with_defaults(self, user):
        """Test FAQ creation with default values."""
        faq = FAQ.objects.create(
            user=user, title="How to use SmartFAQ?", content="This is a guide on how to use SmartFAQ."
        )

        assert faq.user == user
        assert faq.title == "How to use SmartFAQ?"
        assert faq.content == "This is a guide on how to use SmartFAQ."

        # Test default values
        assert faq.number_of_faqs == 3
        assert faq.tone == "neutral"
        assert faq.category == "General"
        assert faq.generated_faqs.count() == 0

    @pytest.mark.parametrize("tone", ["formal", "casual", "neutral"])
    def test_faq_valid_tones(self, basic_faq, tone):
        """Test setting valid tone values."""
        basic_faq.tone = tone
        basic_faq.save()
        assert basic_faq.tone == tone

    def test_faq_string_representation(self, basic_faq):
        """Test FAQ string representation."""
        assert str(basic_faq) == "Test FAQ"

    def test_faq_question_answer_relationships(self, basic_faq, question_answers):
        """Test FAQ and QuestionAnswer relationships."""
        # Add question-answers to FAQ
        basic_faq.generated_faqs.add(*question_answers)

        # Verify relationships
        assert basic_faq.generated_faqs.count() == len(question_answers)
        for qa in question_answers:
            assert qa in basic_faq.generated_faqs.all()

    def test_faq_custom_creation(self, user):
        """Test FAQ creation with custom values."""
        custom_faq = FAQ.objects.create(
            user=user,
            title="Custom FAQ",
            content="Custom content",
            number_of_faqs=5,
            tone="formal",
            category="Technical",
        )

        assert custom_faq.number_of_faqs == 5
        assert custom_faq.tone == "formal"
        assert custom_faq.category == "Technical"


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
