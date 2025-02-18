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
