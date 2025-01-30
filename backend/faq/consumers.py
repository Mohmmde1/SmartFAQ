import json
import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model

from .async_faq_generator import FAQGenerator
from .models import FAQ, QuestionAnswer

logger = logging.getLogger(__name__)
User = get_user_model()

@dataclass
class WSMessage:
    type: str
    data: Dict[str, Any]

class FAQManager:
    def __init__(self, user: User):
        self.user = user

    @sync_to_async
    def get_or_create_faq(self, faq_id: Optional[int] = None) -> FAQ:
        if faq_id:
            return FAQ.objects.get(id=faq_id, user=self.user)
        return FAQ.objects.create(
            title="Generated FAQ",
            content="",
            user=self.user
        )

    @sync_to_async
    def clear_existing_faqs(self, faq: FAQ) -> None:
        faq.generated_faqs.all().delete()

    @sync_to_async
    def update_faq(self, faq: FAQ, content: str, num_questions: int, tone: str) -> None:
        faq.content = content
        faq.number_of_faqs = num_questions
        faq.tone = tone
        faq.save()

    @sync_to_async
    def add_generated_faq(self, faq: FAQ, qa: QuestionAnswer) -> None:
        faq.generated_faqs.add(qa)

class FAQConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info(f"New WebSocket connection: {self.channel_name}")
        try:
            self.user = self.scope['user']
            if not self.user.is_authenticated:
                logger.error("Unauthenticated connection attempt")
                await self.close()
                return

            self.faq_manager = FAQManager(self.user)
            self.faq = None
            await self.accept()

        except Exception as e:
            logger.error(f"Connection error: {str(e)}", exc_info=True)
            await self.close()

    async def handle_faq_generation(self, text: str, num_questions: int, tone: str) -> None:
        try:
            generator = FAQGenerator()
            generated_faqs = []

            async for faq in generator.generate_faqs_stream(text, num_questions, tone):
                generated_faqs.append(faq)
                await self.faq_manager.add_generated_faq(self.faq, faq)
                await self.send_faq_update(faq)

            await self.send_completion_message(generated_faqs)

        except Exception as e:
            logger.error(f"Generation error: {str(e)}", exc_info=True)
            await self.send_error(str(e))

    async def receive(self, text_data: str) -> None:
        try:
            data = json.loads(text_data)
            text = data.get("text")
            num_questions = data.get("num_questions", 5)
            tone = data.get("tone", "neutral")
            faq_id = data.get("faq_id")

            if not text:
                await self.send_error("Input text cannot be empty")
                return

            self.faq = await self.faq_manager.get_or_create_faq(faq_id)
            if faq_id:
                await self.faq_manager.clear_existing_faqs(self.faq)

            await self.faq_manager.update_faq(
                self.faq, text, num_questions, tone
            )
            await self.handle_faq_generation(text, num_questions, tone)

        except Exception as e:
            logger.error(f"Error in receive: {str(e)}", exc_info=True)
            await self.send_error(str(e))

    async def send_faq_update(self, faq: QuestionAnswer) -> None:
        await self.send(json.dumps({
            "type": "faq",
            "faqId": self.faq.id,
            "id": faq.id,
            "question": faq.question,
            "answer": faq.answer,
            "status": "generating"
        }))

    async def send_completion_message(self, generated_faqs: List[QuestionAnswer]) -> None:
        await self.send(json.dumps({
            "type": "status",
            "status": "complete",
            "faq": {
                "id": self.faq.id,
                "title": self.faq.title,
                "content": self.faq.content,
                "generated_faqs": [{
                    "id": qa.id,
                    "question": qa.question,
                    "answer": qa.answer
                } for qa in generated_faqs],
                "number_of_faqs": self.faq.number_of_faqs,
                "tone": self.faq.tone,
                "created_at": self.faq.created_at.isoformat(),
                "updated_at": self.faq.updated_at.isoformat()
            }
        }))

    async def send_error(self, message: str) -> None:
        await self.send(json.dumps({
            "type": "error",
            "message": message
        }))
