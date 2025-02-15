from datetime import timedelta

from .base import *  # noqa: F403

# Database Settings
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "<your-database-name>",
        "USER": "<your-database-user>",
        "PASSWORD": "<your-database-password>",
        "HOST": "<your-database-host>",
        "PORT": "<your-database-port>",
    }
}

# Core Settings
SECRET_KEY = "<your-django-secret-key>"
DEBUG = True  # Set to False in production
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]  # Add your domain in production

# Google OAuth Settings
OAUTH_CALLBACK_URL = "http://localhost:3000"  # Update with your frontend URL
GOOGLE_CLIENT_ID = "<your-google-client-id>"
GOOGLE_CLIENT_SECRET = "<your-google-client-secret>"

# JWT Settings
JWT_SECRET_KEY = SECRET_KEY  # You can use a different key if needed

# Ollama AI Settings
OLLAMA_MODEL = "<your-ollama-model>"  # e.g., "llama2", "gpt-3.5-turbo"

# Simple JWT Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "SIGNING_KEY": JWT_SECRET_KEY,
    "ALGORITHM": "HS256",
}

"""
Instructions:
1. Copy this file and rename it to 'secret.py'
2. Replace all placeholder values (enclosed in <>) with your actual values
3. Ensure secret.py is in .gitignore
4. Never commit secret.py to version control
5. Keep this template updated when adding new sensitive settings
"""