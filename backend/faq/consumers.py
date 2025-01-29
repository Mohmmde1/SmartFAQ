import json
import logging

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from auths.models import User
from faq.async_faq_generator import FAQGenerator

from .models import FAQ

logger = logging.getLogger(__name__)




class FAQConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info(f"New WebSocket connection: {self.channel_name}")
        try:
            # Get user asynchronously
            user = await sync_to_async(User.objects.first)()
            if not user:
                logger.error("No user found")
                await self.close()
                return

            # Create FAQ instance with async user
            self.faq = await sync_to_async(FAQ.objects.create)(
                title="Generated FAQ",
                content="",
                user=user
            )
            logger.info(f"Created FAQ with id: {self.faq.id} for user: {user.id}")
            await self.accept()

        except Exception as e:
            logger.error(f"Error in connect: {str(e)}", exc_info=True)
            await self.close()

    async def disconnect(self, close_code):
        logger.info(f"WebSocket disconnected: {self.channel_name}, code: {close_code}")

    async def receive(self, text_data):
        logger.info(f"Received WebSocket message from: {self.channel_name}")
        data = json.loads(text_data)
        text = data.get("text")
        num_questions = data.get("num_questions", 5)
        tone = data.get("tone", "neutral")

        if not text:
            logger.warning(f"Empty text received from: {self.channel_name}")
            await self.send(json.dumps({"error": "Input text cannot be empty"}))
            return

        # Update FAQ content
        self.faq.content = text
        self.faq.number_of_faqs = num_questions
        self.faq.tone = tone
        await sync_to_async(self.faq.save)()

        faq_generator = FAQGenerator()
        try:
            generated_faqs = []
            async for faq in faq_generator.generate_faqs_stream(text, num_questions, tone):
                logger.debug(f"Adding FAQ {faq.id} to collection")
                generated_faqs.append(faq)

                await sync_to_async(self.faq.generated_faqs.add)(faq)

                await self.send(json.dumps({
                    "type": "faq",
                    "faqId": self.faq.id,
                    "id": faq.id,
                    "question": faq.question,
                    "answer": faq.answer,
                    "status": "generating"
                }))

            # Send complete FAQ object
            logger.info(f"FAQ generation completed for: {self.channel_name}")
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

        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            await self.send(json.dumps({
                "type": "error",
                "message": str(e)
            }))
