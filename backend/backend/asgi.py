import os
import django  # Import Django first

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()  # Explicitly initialize Django before anything else

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from auths.custom_ws_middleware import TokenAuthMiddleware
from faq.routing import websocket_urlpatterns

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": TokenAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
