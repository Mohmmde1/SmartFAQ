# faq/management/commands/populate_faqs.py
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from faq.models import FAQ, QuestionAnswer

User = get_user_model()


class Command(BaseCommand):
    """
    Command to populate the database with sample FAQs and questions/answers.
    Includes commit and rollback functionality based on a --commit flag.
    """

    help = "Populate the database with sample FAQs and questions/answers."

    def add_arguments(self, parser):
        """
        Add arguments to the command.
        """
        parser.add_argument(
            "--email",
            "-e",
            required=False,
            help="Email of the owner of the faqs"
        )
        parser.add_argument(
            "--commit",
            "-c",
            action="store_true",
            default=False,
            help="Commit changes to the database. By default, performs a dry-run.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Main logic for populating the database.
        """
        sid = transaction.savepoint()  # Create a savepoint
        try:
            # Extract the args 
            commit = options["commit"]
            email = options["email"]
            
            if not email:
                # Create a sample user
                user, created = User.objects.get_or_create(email="sampleuser@example.com")
                if created:
                    user.set_password("password123")
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"Created sample user: {user.email}"))
            else:
                user = User.objects.get(email=email)
                self.stdout.write(self.style.SUCCESS(f"Use {email}!"))

            # Sample FAQ content
            faqs_data = [
                {
                    "title": "How to use SmartFAQ?",
                    "content": "SmartFAQ helps users generate FAQs from their content.",
                    "questions": [
                        {"question": "What is SmartFAQ?", "answer": "SmartFAQ is a tool for generating FAQs."},
                        {"question": "How do I use it?", "answer": "Upload your content, and FAQs are generated auto."},
                    ],
                },
                {
                    "title": "Features of SmartFAQ",
                    "content": "SmartFAQ supports FAQ generation, saving, and sharing.",
                    "questions": [
                        {"question": "What are the features?", "answer": "SmartFAQ generates, saves,and manages FAQs."},
                        {"question": "Can I share FAQs?", "answer": "Yes, FAQs can be shared with others."},
                    ],
                },
            ]

            # Create FAQs and related questions
            for faq_data in faqs_data:
                faq = FAQ.objects.create(
                    user=user,
                    title=faq_data["title"],
                    content=faq_data["content"],
                )

                for question_data in faq_data["questions"]:
                    question = QuestionAnswer.objects.create(
                        question=question_data["question"],
                        answer=question_data["answer"],
                    )
                    faq.generated_faqs.add(question)

                self.stdout.write(self.style.SUCCESS(f"Added FAQ: {faq.title}"))

            # Commit or rollback transaction based on --commit flag
            if commit:
                transaction.savepoint_commit(sid)
                self.stdout.write(
                    self.style.SUCCESS("Database population completed successfully with changes committed.")
                )
            else:
                transaction.savepoint_rollback(sid)
                self.stdout.write(self.style.WARNING("Dry-run completed successfully. No changes committed."))

        except Exception as e:
            transaction.savepoint_rollback(sid)
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))
