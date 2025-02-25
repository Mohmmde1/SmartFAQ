###############################################################################
# Import Statements and Dependencies
###############################################################################

import os
from pathlib import Path

###############################################################################
# Core Settings
###############################################################################
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_URLCONF = "core.urls"
WSGI_APPLICATION = "core.wsgi.application"

###############################################################################
# Application Settings
###############################################################################
# Django built-in apps
DJANGO_APPS = [
    "daphne",  # must be before 'django.contrib.staticfiles'
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
]

# Custom project apps
CUSTOM_APPS = [
    "auths",
    "faq",
]

# Third-party apps
THIRD_PARTY_APPS = [
    # Django Tool Bar
    "debug_toolbar",
    # DRF
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "drf_standardized_errors",
    # allauth + dj-rest-auth
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
]

# Combine all apps
INSTALLED_APPS = DJANGO_APPS + CUSTOM_APPS + THIRD_PARTY_APPS

MIDDLEWARE = [
    # CORS MIDDLEWARE
    "corsheaders.middleware.CorsMiddleware",
    # DJANGO DEFAULT MIDDLEWARE
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # ALLAUTH MIDDLEWARE
    "allauth.account.middleware.AccountMiddleware",
    # DEBUG TOOLBAR
    "debug_toolbar.middleware.DebugToolbarMiddleware",
]

###############################################################################
# Template Settings
###############################################################################
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

###############################################################################
# Authentication Settings
###############################################################################
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

# Use Email as the primary identifier
AUTH_USER_MODEL = "auths.User"
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = "email"

# Email verification setup
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_CONFIRM_EMAIL_ON_GET = True

###############################################################################
# Internationalization Settings
###############################################################################
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

###############################################################################
# Static Files Settings
###############################################################################
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")

###############################################################################
# Model Settings
###############################################################################
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

###############################################################################
# REST Framework Settings
###############################################################################
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.BasicAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "EXCEPTION_HANDLER": "drf_standardized_errors.handler.exception_handler",
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}

###############################################################################
# CORS Settings
###############################################################################
CORS_ORIGIN_ALLOW_ALL = True
CSRF_TRUSTED_ORIGINS = ["http://localhost", "https://localhost", "http://127.0.0.1", "https://127.0.0.1"]

###############################################################################
# Allauth
###############################################################################
SITE_ID = 1
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": [
            "profile",
            "email",
        ],
        "AUTH_PARAMS": {
            "access_type": "offline",
        },
    }
}
SOCIALACCOUNT_EMAIL_REQUIRED = False
SOCIALACCOUNT_ADAPTER = "auths.adapter.CustomSocialAccountAdapter"

###############################################################################
# JWT Settings
###############################################################################
REST_USE_JWT = True

###############################################################################
# Dj-Rest-Auth Settings
###############################################################################
REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_HTTPONLY": False,  # Important for the frontend to access the refresh token
    "REGISTER_SERIALIZER": "auths.serializers.CustomRegisterSerializer",
}

###############################################################################
# Ollama AI Settings
###############################################################################
OLLAMA_MODEL = os.environ.get("OLLAMA_AI_MODEL", "llama3.2")

###############################################################################
# Logging Settings
###############################################################################
# Ensure logs directory exists
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "filters": {
        "require_debug_true": {
            "()": "django.utils.log.RequireDebugTrue",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "filters": [],
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": LOGS_DIR / "django.log",
            "formatter": "verbose",
        },
        "faq_file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": LOGS_DIR / "faq.log",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": True,
        },
        "faq": {
            "handlers": ["console", "faq_file"],
            "level": "DEBUG",
            "propagate": True,
        },
        "auths": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": True,
        },
    },
}

###############################################################################
# ASGI Settings
###############################################################################
ASGI_APPLICATION = "core.asgi.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}

###############################################################################
# Debug Toolbar
###############################################################################
INTERNAL_IPS = [
    "127.0.0.1",
]

###############################################################################
# FAQ settings
###############################################################################
INACTIVITY_TIME_ENABLED = False
INACTIVITY_TIME = 60
