import logging
import re
from dataclasses import dataclass
from typing import List

import ollama
from asgiref.sync import sync_to_async
from django.conf import settings
from pydantic import BaseModel, Field

from .models import QuestionAnswer

logger = logging.getLogger(__name__)

class QuestionAnswerSchema(BaseModel):
    question: str = Field(..., min_length=1)
    answer: str = Field(..., min_length=1)

class FAQSchema(BaseModel):
    generated_faqs: List[QuestionAnswerSchema]

@dataclass
class FAQPrompt:
    TEMPLATE = """
    Generate {num_questions} frequently asked questions and answers about the following text.
    Use a {tone} tone in both questions and answers.

    Text: {text}
    """

class FAQGenerator:
    def __init__(self, model_name: str = settings.OLLAMA_MODEL):
        self.model_name = model_name
        self.client = ollama.AsyncClient()
        logger.info(f"Initialized FAQGenerator with model: {model_name}")

    async def generate_faqs_stream(
        self,
        text: str,
        num_questions: int = 5,
        tone: str = 'neutral'
    ):
        logger.info(f"Starting FAQ generation: questions={num_questions}, tone={tone}")

        if not text.strip():
            logger.warning("Empty text provided")
            raise ValueError("Input text cannot be empty")

        if num_questions < 1:
            logger.warning(f"Invalid number of questions: {num_questions}")
            raise ValueError("Number of questions must be positive")

        content = FAQPrompt.TEMPLATE.format(
            num_questions=num_questions,
            tone=tone,
            text=text
        )
        logger.debug(f"Generated prompt with length: {len(content)}")

        try:
            logger.debug("Initiating chat stream")
            stream = await self.client.chat(
                model=self.model_name,
                messages=[{"role": "user", "content": content}],
                stream=True,
                format=FAQSchema.model_json_schema()
            )

            buffer = ""
            pattern = r'\{\s*"question"\s*:\s*"(.*?)",\s*"answer"\s*:\s*"(.*?)"\s*\}'
            async for chunk in stream:
                if 'message' in chunk and 'content' in chunk['message']:
                    buffer += chunk['message']['content']
                    match = re.search(pattern, buffer)
                    if match:
                        logger.info("Creating new QuestionsAnswer from matched content")
                        faq = await sync_to_async(QuestionAnswer.objects.create)(
                            question=match.group(1),
                            answer=match.group(2)
                        )
                        logger.debug(f"Created QuestionsAnswer with id: {faq.id}")
                        buffer = ""
                        yield faq

        except Exception as e:
            logger.error(f"Error in FAQ generation: {str(e)}", exc_info=True)
            raise
