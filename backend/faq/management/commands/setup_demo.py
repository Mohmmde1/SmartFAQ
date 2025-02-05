from django.core.management.base import BaseCommand
from django.db import transaction

from auths.models import User
from faq.models import FAQ, QuestionAnswer


class Command(BaseCommand):
    help = "Creates a superuser and demo FAQs"

    def handle(self, *args, **kwargs):
        try:
            with transaction.atomic():
                # Create superuser
                if not User.objects.filter(email="admin@example.com").exists():
                    User.objects.create_superuser("admin@example.com", "admin123")
                    self.stdout.write("Created superuser: admin@example.com / admin123")

                # Create demo FAQ
                faq = FAQ.objects.create(
                    title="Getting Started with SmartFAQ",
                    content="""
                    SmartFAQ is an AI-powered FAQ generation tool.
                    It helps you create comprehensive FAQs from your content.
                    """,
                    user=User.objects.get(email="admin@example.com"),
                )

                # Create sample Q&As
                questions = [
                    {
                        "question": "What is SmartFAQ?",
                        "answer": "SmartFAQ is an AI-powered tool that automatically generates FAQs from your content.",
                    },
                    {
                        "question": "How does it work?",
                        "answer": "Simply paste your content or upload a PDF.",
                    },
                ]

                for q in questions:
                    QuestionAnswer.objects.create(faq=faq, question=q["question"], answer=q["answer"])

                self.stdout.write("Created demo FAQ with sample questions")

        except Exception as e:
            self.stderr.write(f"Error: {str(e)}")
