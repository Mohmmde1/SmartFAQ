from datetime import timedelta

from .base import *  # noqa: F403

# Database Settings
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "<your-database-name>",
        "USER": "<your-database-user>",
        "PASSWORD": "<your-database-password>",
        "HOST": "<your-database-host>",  # Usually 'localhost' for local development
        "PORT": "<your-database-port>",  # Usually '5432' for PostgreSQL
    }
}

# Core Settings
SECRET_KEY = "<your-django-secret-key>"
DEBUG = True  # Set to False in production
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "backend"]  # Add your domain in production

# Authentication Settings
LOGIN_URL = "<your-frontend-auth-url>"  # Where user will be direct when verify email e.g., "http://localhost:3000/auth"

# Email Settings
EMAIL_HOST_USER = "<your-email-address>"
EMAIL_HOST_PASSWORD = "<your-email-app-password>"

# Google OAuth Settings
OAUTH_CALLBACK_URL = "<your-frontend-url>"  # e.g., "http://localhost:3000"
GOOGLE_CLIENT_ID = "<your-google-client-id>"
GOOGLE_CLIENT_SECRET = "<your-google-client-secret>"

# JWT Settings
JWT_SECRET_KEY = SECRET_KEY  # You can use a different key if needed

# AI Model Settings
OLLAMA_MODEL = "<your-ollama-model>"  # e.g., "gemma", "llama2", "mistral"

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

# Optional Settings (uncomment if needed)
# ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = "<your-frontend-login-url>"
# ACCOUNT_EMAIL_CONFIRMATION_ANONYMOUS_REDIRECT_URL = "<your-frontend-welcome-url>"

"""
Instructions:
1. Copy this file and rename it to 'secret.py'
2. Replace all placeholder values (enclosed in <>) with your actual values
3. Ensure secret.py is in .gitignore
4. Never commit secret.py to version control
5. Keep this template updated when adding new sensitive settings

Security Notes:
- Generate a secure Django secret key for production
- Use environment variables for sensitive data in production
- Set DEBUG to False in production
- Use strong passwords and keep them secure
- Regularly rotate secrets and API keys
- Use SSL/TLS in production
"""
