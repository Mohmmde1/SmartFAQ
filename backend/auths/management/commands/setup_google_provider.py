from allauth.socialaccount.models import SocialApp
from django.contrib.auth import get_user_model
from django.contrib.sites.models import Site
from django.core.management.base import BaseCommand
from django.db import transaction

UserModel = get_user_model()


class Command(BaseCommand):
    """
    Management command to set up a Google SocialApp and related configurations.
    This includes:
    - Adding or updating a SocialApp.
    - Associating the SocialApp with the first Site.
    """

    help = "Set up a Google SocialApp"

    def add_arguments(self, parser):
        """
        Define the arguments required for the management command.
        """
        parser.add_argument(
            "--name", "-n", required=True, help="Project name for the SocialApp."
        )
        parser.add_argument(
            "--client_id", "-ci", required=True, help="Client ID for the Google app."
        )
        parser.add_argument(
            "--secret_key",
            "-sk",
            required=True,
            help="Secret key for the Google app.",
        )
        parser.add_argument(
            "--commit",
            "-c",
            action="store_true",
            default=False,
            help="If provided, the changes will be committed to the database.",
        )

    @transaction.atomic
    def handle(self, **options):
        """
        Execute the command logic to set up the Google SocialApp.
        """
        sid = transaction.savepoint()
        try:
            # Extract options
            name = options["name"]
            client_id = options["client_id"]
            secret_key = options["secret_key"]
            commit = options["commit"]

            provider = "google"
            self.stdout.write(f"Using provider: {provider}")

            # Step 1: Clear existing SocialApps for the provider
            SocialApp.objects.filter(provider=provider).delete()
            self.stdout.write(f"Deleted all existing SocialApps for provider '{provider}'.")

            # Step 2: Create or update SocialApp
            sa_obj, created = SocialApp.objects.get_or_create(provider=provider)
            sa_obj.name = name
            sa_obj.client_id = client_id
            sa_obj.secret = secret_key
            sa_obj.save()
            self.stdout.write(
                f"{'Created' if created else 'Updated'} SocialApp: {name}"
            )

            # Step 3: Associate SocialApp with the first site
            site_obj = Site.objects.first()
            if not site_obj:
                raise ValueError(
                    "No sites found. Please create a Site object before running this command."
                )
            sa_obj.sites.add(site_obj)
            self.stdout.write(
                f"Associated SocialApp '{name}' with Site: {site_obj.domain}"
            )

            # Commit or rollback transaction based on --commit flag
            if commit:
                transaction.savepoint_commit(sid)
                self.stdout.write(
                    self.style.SUCCESS(
                        "Setup completed successfully with changes committed."
                    )
                )
            else:
                transaction.savepoint_rollback(sid)
                self.stdout.write(
                    self.style.WARNING(
                        "Dry-run completed successfully. No changes committed."
                    )
                )

        except Exception as e:
            transaction.savepoint_rollback(sid)
            self.stderr.write(self.style.ERROR(f"An error occurred: {e}"))
