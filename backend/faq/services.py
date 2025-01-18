from typing import List

from .faq_generator import FAQGenerator
from .models import QuestionAnswer


def generate_faq(text: str, number_of_faqs: int = 5) -> List[QuestionAnswer]:
    generator = FAQGenerator()
    sentences, phrases = generator.preprocess_text(text)
    ranked_phrases = generator.rank_phrases(text, phrases)
    questions = generator.generate_questions(ranked_phrases, number_of_faqs)
    return generator.generate_answers(questions, text)
