import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

from .base import *  # noqa: F403

# Load environment variables from .env.local
env_path = Path(__file__).resolve().parent.parent.parent / ".env.local"
load_dotenv(env_path)


###############################################################################
# Database Settings
###############################################################################
database_url = (
    f"postgresql://{os.environ.get('DB_USER')}:{os.environ.get('DB_PASSWORD')}"
    f"@{os.environ.get('DB_HOST')}:{os.environ.get('DB_PORT')}"
    f"/{os.environ.get('DB_NAME')}"
)
DATABASES = {"default": dj_database_url.config(default=database_url)}

# Additional local-specific settings
DEBUG = os.environ.get("DEBUG", "True") == "True"

###############################################################################
# Social Authentication Settings
###############################################################################
OAUTH_CALLBACK_URL = os.environ.get("OAUTH_CALLBACK_URL")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
