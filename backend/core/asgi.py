import os

import django  # Import Django first

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()  # Explicitly initialize Django before anything else

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from django.core.asgi import get_asgi_application  # noqa: E402

from auths.custom_ws_middleware import TokenAuthMiddleware  # noqa: E402
from faq.helpers.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": TokenAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
