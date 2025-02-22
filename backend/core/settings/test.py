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

# Use in-memory cache for tests
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# Disable debugging
DEBUG = False

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
