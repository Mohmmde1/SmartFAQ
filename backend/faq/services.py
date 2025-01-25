from typing import List

from .faq_generator import FAQGenerator
from .models import QuestionAnswer


def generate_faq(text: str, number_of_faqs: int = 5) -> List[QuestionAnswer]:
    """
    Generate FAQs using the FAQGenerator class.

    Args:
        text (str): Input text to generate FAQs from.
        number_of_faqs (int): Number of FAQs to generate.

    Returns:
        List[QuestionAnswer]: List of QuestionAnswer objects with generated FAQs.
    """
    generator = FAQGenerator()
    return generator.generate_faqs(text, number_of_faqs)
