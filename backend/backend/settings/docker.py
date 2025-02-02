import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

# Load environment variables from .env.docker
env_path = Path(__file__).resolve().parent.parent.parent / ".env.docker"
load_dotenv(env_path)

from .base import *  # noqa: E402, F403

###############################################################################
# Database Settings
###############################################################################
database_url = (
    f"postgresql://{os.environ.get('DB_USER')}:{os.environ.get('DB_PASSWORD')}"
    f"@{os.environ.get('DB_HOST')}:{os.environ.get('DB_PORT')}"
    f"/{os.environ.get('DB_NAME')}"
)
DATABASES = {"default": dj_database_url.config(default=database_url)}

# Additional docker-specific settings
DEBUG = os.environ.get("DEBUG", "False") == "True"
STATIC_ROOT = "/app/static"

###############################################################################
# Social Authentication Settings
###############################################################################
OAUTH_CALLBACK_URL = os.environ.get("OAUTH_CALLBACK_URL", "http://localhost")
