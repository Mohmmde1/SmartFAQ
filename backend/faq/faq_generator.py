from typing import List

import ollama
from django.conf import settings
from pydantic import BaseModel

from .models import QuestionAnswer


class QuestionAnswerSchema(BaseModel):
    question:str
    answer:str

class FAQ(BaseModel):
    generated_faqs:List[QuestionAnswerSchema]

class FAQGenerator:
    def __init__(self, model_name: str = settings.OLLAMA_MODEL):
        self.model_name = model_name

    def generate_faqs(self, text: str, num_questions: int = 5) -> List[dict]:
        """
        Main method to generate FAQs from input text.
        """
        faqs = []

        try:
            # Generate a question and answer using Ollama
            response = ollama.chat(
                model=self.model_name,
                messages=[
                    {
                        "role": "user",
                        "content": f"Generate {num_questions} faqs of question and answer about: {text}",
                    },
                ],
                format=FAQ.model_json_schema()
            )
            question_answer = FAQ.model_validate_json(response.message.content)

            for faq in question_answer.generated_faqs:
                question = faq.question
                answer = faq.answer
                qa = QuestionAnswer.objects.create(
                    question=question,
                    answer=answer
                )
                faqs.append(qa)
        except Exception as e:
            answer = f"Error generating FAQ: {str(e)}"
            print(answer)
        return faqs
