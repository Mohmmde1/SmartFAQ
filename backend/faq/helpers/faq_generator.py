import logging
from dataclasses import dataclass
from threading import Lock
from typing import List

import ollama
from django.conf import settings
from pydantic import BaseModel, Field

from ..models import QuestionAnswer

logger = logging.getLogger(__name__)


class QuestionAnswerSchema(BaseModel):
    question: str = Field(..., min_length=1)
    answer: str = Field(..., min_length=1)


class FAQ(BaseModel):
    generated_faqs: List[QuestionAnswerSchema]


@dataclass
class FAQPrompt:
    TEMPLATE = """
    Generate {num_questions} frequently asked questions and answers about the following text.
    Use a {tone} tone in both questions and answers.
    Format the response as JSON with 'generated_faqs' containing an array of objects with
    'question' and 'answer' fields.

    Text: {text}
    """


class FAQGenerator:
    """
    Singleton class for generating FAQs using AI.
    Thread-safe implementation using double-checked locking pattern.
    """

    _instance = None
    _lock = Lock()

    def __new__(cls):
        if not cls._instance:
            with cls._lock:
                # Double check to prevent race condition
                if not cls._instance:
                    cls._instance = super().__new__(cls)
                    # Initialize any expensive resources here
                    cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize expensive resources once."""
        # Initialize AI model or other expensive resources
        self._model = settings.OLLAMA_MODEL  # Your AI model initialization
        self._is_initialized = False

    def __init__(self):
        # This will only run once due to __new__
        if not getattr(self, "_is_initialized", False):
            self._is_initialized = True

    def generate_faqs(self, text: str, num_questions: int = 5, tone: str = "neutral") -> List[QuestionAnswer]:
        """
        Generate FAQs from input text using Ollama.

        Args:
            text: Input text to generate FAQs from
            num_questions: Number of FAQs to generate
            tone: Tone of the FAQs (e.g., 'neutral', 'friendly', 'professional')

        Returns:
            List of QuestionAnswer objects

        Raises:
            ValueError: If input parameters are invalid
        """
        if not text.strip():
            raise ValueError("Input text cannot be empty")

        if num_questions < 1:
            raise ValueError("Number of questions must be positive")

        faqs: List[QuestionAnswer] = []

        try:
            content = FAQPrompt.TEMPLATE.format(num_questions=num_questions, tone=tone, text=text)

            response = ollama.chat(
                model=self._model, messages=[{"role": "user", "content": content}], format=FAQ.model_json_schema()
            )

            question_answer = FAQ.model_validate_json(response.message.content)

            for faq in question_answer.generated_faqs:
                qa = QuestionAnswer.objects.create(question=faq.question, answer=faq.answer)
                faqs.append(qa)

            return faqs

        except Exception as e:
            logger.error(f"Error generating FAQs: {str(e)}")
            raise
