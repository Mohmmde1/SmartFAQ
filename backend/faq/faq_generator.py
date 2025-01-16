# faq/faq_generator.py
from .models import QuestionAnswer


def generate_faq(text: str, no_of_faqs: int) -> list[QuestionAnswer]:
    """Generate dummy FAQs aligned with QuestionAnswer model"""
    dummy_faqs = [
        QuestionAnswer.objects.create(
            question="What is this text about?",
            answer="This text is about implementing FAQ generation."
        ),
        QuestionAnswer.objects.create(
            question="How long is the text?",
            answer=f"The text is {len(text)} characters long."
        ),
        QuestionAnswer.objects.create(
            question="What is the main topic?",
            answer="The main topic appears to be FAQ generation and management."
        )
    ]

    return dummy_faqs
