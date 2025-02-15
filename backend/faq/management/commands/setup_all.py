import ssl
import subprocess

import nltk
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Run all setup commands (migrations, Ollama, demo data, Google auth)"

    def add_arguments(self, parser):
        parser.add_argument("--skip-migrations", action="store_true")
        parser.add_argument("--skip-ollama", action="store_true")
        parser.add_argument("--skip-demo", action="store_true")
        parser.add_argument("--skip-google", action="store_true")

    def handle(self, *args, **options):
        self.stdout.write("Setting up nltk...")

        # Fix SSL issue and download nltk data
        ssl._create_default_https_context = ssl._create_unverified_context
        nltk.download('punkt_tab')

        if not options["skip_migrations"]:
            self.stdout.write("Running migrations...")
            call_command("migrate")

        if not options["skip_ollama"]:
            self.stdout.write("Setting up Ollama...")
            subprocess.run(["ollama", "install"], check=True)
            subprocess.run(["ollama", "start", settings.OLLAMA_MODEL], check=True)

        if not options["skip_demo"]:
            self.stdout.write("Setting up demo data...")
            call_command("setup_demo")

        if not options["skip_google"] and settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
            self.stdout.write("Setting up Google auth...")
            call_command(
                "setup_google_provider",
                name="Google",
                client_id=settings.GOOGLE_CLIENT_ID,
                secret_key=settings.GOOGLE_CLIENT_SECRET,
                commit=True,
            )
