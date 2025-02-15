import logging
import platform
import subprocess
import time

import psutil
import requests
from django.conf import settings
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Manage Ollama service: install, start, or stop"

    def add_arguments(self, parser):
        parser.add_argument("action", choices=["install", "start", "stop"], help="Action to perform")
        parser.add_argument(
            "--model", default=getattr(settings, "OLLAMA_MODEL", "llama3.2"), help="Model to install (for start action)"
        )

    def check_ollama_installed(self):
        try:
            subprocess.run(["ollama", "--version"], capture_output=True, check=True)
            return True
        except (FileNotFoundError, subprocess.CalledProcessError):
            return False

    def install_ollama(self):
        system = platform.system().lower()
        self.stdout.write(f"Installing Ollama on {system}...")

        try:
            if system == "linux":
                subprocess.run(["curl", "-fsSL", "https://ollama.ai/install.sh", "|", "sh"], shell=True, check=True)
            elif system == "darwin":  # macOS
                subprocess.run(["brew", "install", "ollama"], check=True)
            elif system == "windows":
                self.stderr.write("Please install Ollama manually from https://ollama.ai/download for Windows.")
                return False
            else:
                self.stderr.write(f"Unsupported operating system: {system}")
                return False
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install Ollama: {e}")
            return False

    def check_service_running(self):
        """Check if Ollama service is running by looking for its process."""
        for proc in psutil.process_iter(["pid", "name"]):
            try:
                if "ollama" in proc.info["name"].lower():
                    self.stdout.write(f"Ollama service is running (PID: {proc.info['pid']})")
                    return True
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        self.stdout.write("Ollama service is not running")
        return False


    def start_service(self, model_name):
        if not self.check_service_running():
            self.stdout.write("Starting Ollama service...")
            subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(5)
        
        self.stdout.write(f"Loading model {model_name}...")
        try:
            subprocess.run(["ollama", "pull", model_name], check=True)
            return True
        except subprocess.CalledProcessError:
            return False

    def stop_service(self):
        try:
            subprocess.run(["pkill", "ollama"], check=True)
            return True
        except subprocess.CalledProcessError:
            for proc in psutil.process_iter(["pid", "name"]):
                try:
                    if "ollama" in proc.info["name"].lower():
                        proc.kill()
                        return True
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            return False

    def handle(self, *args, **options):
        action = options["action"]

        if action == "install":
            if self.check_ollama_installed():
                self.stdout.write("Ollama already installed")
                return
            success = self.install_ollama()
            msg = "Installation successful" if success else "Installation failed"

        elif action == "start":
            if not self.check_ollama_installed():
                self.stderr.write("Ollama not installed. Run install first")
                return
            success = self.start_service(options["model"])
            msg = "Service started" if success else "Failed to start service"

        elif action == "stop":
            success = self.stop_service()
            msg = "Service stopped" if success else "No running service found"

        if success:
            self.stdout.write(self.style.SUCCESS(msg))
        else:
            self.stderr.write(self.style.ERROR(msg))