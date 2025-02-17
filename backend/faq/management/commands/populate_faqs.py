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
            "--quantity",
            "-q",
            required=False,
            default=5,
            help="Number of faqs to be generated"
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
            # Extract options
            quantity = int(options["quantity"])
            email = options["email"]
            commit = options["commit"]
            
            # Handle user creation/retrieval
            if not email:
                user, created = User.objects.get_or_create(
                    email="sampleuser@example.com",
                    defaults={'is_active': True}
                )
                if created:
                    user.set_password("password123")
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"Created sample user: {user.email}"))
            else:
                user = User.objects.get(email=email)
                self.stdout.write(self.style.SUCCESS(f"Using existing user: {email}"))

            # Sample data
            titles = ["Features of SmartFAQ", "How to use SmartFAQ?"]
            contents = [
                "SmartFAQ helps users generate FAQs from their content.", 
                "SmartFAQ supports FAQ generation, saving, and sharing." 
            ]
            qa_pairs = [
                ('What is SmartFAQ?', 'SmartFAQ is a tool for generating FAQs.'),
                ('How do I use it?', 'Upload your content, and FAQs are generated auto.'),
                ('What are the features?', 'SmartFAQ generates, saves, and manages FAQs.'),
                ('Can I share FAQs?', 'Yes, FAQs can be shared with others.')
            ]

            # Create FAQs and their Q&As
            for _ in range(quantity):
                faq = FAQ.objects.create(
                    title=titles[_ % len(titles)],
                    content=contents[_ % len(contents)],
                    user=user
                )
                
                # Create Q&As for each FAQ
                for question, answer in qa_pairs:
                    QuestionAnswer.objects.create(
                        faq=faq,
                        question=question,
                        answer=answer
                    )

            # Handle transaction
            if commit:
                transaction.savepoint_commit(sid)
                self.stdout.write(
                    self.style.SUCCESS(f"Created {quantity} FAQs with Q&As. Changes committed.")
                )
            else:
                transaction.savepoint_rollback(sid)
                self.stdout.write(
                    self.style.WARNING("Dry-run completed. No changes committed.")
                )

        except Exception as e:
            transaction.savepoint_rollback(sid)
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))
