import asyncio
import json
import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.contrib.auth import get_user_model

from ..models import FAQ, QuestionAnswer
from ..serializers import FAQSerializer, QuestionAnswerSerializer
from .async_faq_generator import FAQGenerator

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
        return FAQ.objects.create(title="Generated FAQ", content="", user=self.user)

    @sync_to_async
    def clear_existing_faqs(self, faq: FAQ) -> None:
        faq.generated_faqs.all().delete()

    @sync_to_async
    def update_faq(self, faq: FAQ, content: str, num_questions: int, tone: str) -> None:
        # Generate title from first 25 chars of content
        title = content[:25].strip()
        if len(content) > 25:
            title = title.rsplit(" ", 1)[0] + "..."
        faq.title = title
        faq.content = content
        faq.number_of_faqs = num_questions
        faq.tone = tone
        faq.save()

    @sync_to_async
    def add_generated_faq(self, faq: FAQ, qa: QuestionAnswer) -> None:
        faq.generated_faqs.add(qa)


class FAQConsumer(AsyncWebsocketConsumer):
    @sync_to_async
    def serialize_question_answer(self, qa: QuestionAnswer) -> dict:
        serializer = QuestionAnswerSerializer(qa)
        return serializer.data

    @sync_to_async
    def serialize_faq(self, faq: FAQ) -> dict:
        serializer = FAQSerializer(faq)
        return serializer.data

    async def connect(self):
        logger.info(f"New WebSocket connection: {self.channel_name}")
        try:
            self.user = self.scope["user"]
            if not self.user.is_authenticated:
                logger.error("Unauthenticated connection attempt")
                await self.close()
                return

            self.faq_manager = FAQManager(self.user)
            self.faq = None
            if settings.INACTIVITY_TIME_ENABLED:
                self.inactive_task = asyncio.create_task(self.close_on_inactivity())
            await self.accept()

        except Exception as e:
            logger.error(f"Connection error: {str(e)}", exc_info=True)
            await self.close()

    async def close_on_inactivity(self):
        """Closes WebSocket after a period of inactivity."""
        try:
            await asyncio.sleep(settings.INACTIVITY_TIME)
            logger.info("Closing WebSocket due to inactivity")
            await self.send_error("Connection closed due to inactivity.")
            await self.close()
        except asyncio.CancelledError:
            pass

    async def handle_faq_generation(self, text: str, num_questions: int, tone: str) -> None:
        try:
            self.is_generating = True
            self.generator = FAQGenerator()
            generated_faqs = []

            async for faq in self.generator.generate_faqs_stream(text, num_questions, tone):
                if not self.is_generating:
                    break
                generated_faqs.append(faq)
                await self.faq_manager.add_generated_faq(self.faq, faq)
                await self.send_faq_update(faq)

            await self.send_completion_message(generated_faqs)

        except Exception as e:
            logger.error(f"Generation error: {str(e)}", exc_info=True)
            await self.send_error(str(e))
        finally:
            self.is_generating = False
            self.generator = None

    async def receive(self, text_data: str) -> None:
        try:
            data = json.loads(text_data)

            if data.get("type") == "stop":
                self.is_generating = False
                if self.generator:
                    await self.generator.stop()
                await self.send_json({"type": "status", "status": "stopped"})
                return

            # Validate input using serializer
            serializer = FAQSerializer(
                data={
                    "content": data.get("text", ""),
                    "number_of_faqs": data.get("num_questions", 5),
                    "tone": data.get("tone", "neutral"),
                }
            )

            if not serializer.is_valid():
                await self.send_error(str(serializer.errors))
                return

            validated_data = serializer.validated_data
            self.faq = await self.faq_manager.get_or_create_faq(data.get("faq_id"))

            if data.get("faq_id"):
                await self.faq_manager.clear_existing_faqs(self.faq)

            await self.faq_manager.update_faq(
                self.faq, validated_data["content"], validated_data["number_of_faqs"], validated_data["tone"]
            )

            # Add timeout to handle_faq_generation
            try:
                timeout_seconds = 120
                await asyncio.wait_for(
                    self.handle_faq_generation(
                        validated_data["content"], validated_data["number_of_faqs"], validated_data["tone"]
                    ),
                    timeout=timeout_seconds,
                )
            except asyncio.TimeoutError:
                logger.error("FAQ generation timed out")
                await self.send_error("FAQ generation took too long and was stopped.")

        except Exception as e:
            logger.error(f"Error in receive: {str(e)}", exc_info=True)
            await self.send_error(str(e))

    async def send_faq_update(self, faq: QuestionAnswer) -> None:
        serialized_data = await self.serialize_question_answer(faq)
        await self.send(json.dumps({"type": "faq", "faqId": self.faq.id, **serialized_data, "status": "generating"}))

    async def send_completion_message(self, generated_faqs: List[QuestionAnswer]) -> None:
        serialized_data = await self.serialize_faq(self.faq)
        await self.send(json.dumps({"type": "status", "status": "complete", "faq": serialized_data}))

    async def send_error(self, message: str) -> None:
        await self.send(json.dumps({"type": "error", "message": message}))
