import os

# Default to 'secret' settings, but allow override via DJANGO_SETTINGS_MODULE
settings_module = os.getenv("DJANGO_SETTINGS_MODULE", "core.settings.secret")

if settings_module == "core.settings.test":
    try:
        from .test import *  # noqa: F403
    except ImportError as e:
        raise ImportError(
            "Could not import settings from 'test.py'. "
            "Make sure the file exists and contains the required settings. "
            f"Original error: {str(e)}"
        ) from e
else:
    try:
        from .secret import *  # noqa: F403
    except ImportError as e:
        raise ImportError(
            "Could not import settings from 'secret.py'. "
            "Make sure the file exists and contains the required settings. "
            f"Original error: {str(e)}"
        ) from e
    except Exception as e:
        raise Exception(
            "An unexpected error occurred while importing settings from 'secret.py'. " f"Error: {str(e)}"
        ) from e
