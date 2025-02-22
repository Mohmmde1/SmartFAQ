from datetime import timedelta

from .base import *  # noqa: F403

# Database settings for tests
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "test_db",
        "USER": "postgres",
        "PASSWORD": "postgres",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

# Core Settings
SECRET_KEY = "test-secret-key"
DEBUG = False
ALLOWED_HOSTS = ["testserver"]

# JWT Settings for tests
JWT_SECRET_KEY = SECRET_KEY

# Simple JWT Settings for tests
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "SIGNING_KEY": JWT_SECRET_KEY,
    "ALGORITHM": "HS256",
}

# Mock OAuth Settings
OAUTH_CALLBACK_URL = "http://testserver"
GOOGLE_CLIENT_ID = "test-client-id"
GOOGLE_CLIENT_SECRET = "test-client-secret"

# Mock AI Settings
OLLAMA_MODEL = "test-model"

# Use in-memory cache for tests
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# Use fast password hasher for tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# Use test storage
DEFAULT_FILE_STORAGE = "django.core.files.storage.InMemoryStorage"

# Disable logging during tests
LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
}
