import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from src.config import routing
from src.config.middleware import JwtAuthMiddleware

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": JwtAuthMiddleware(URLRouter(routing.websocket_urlpatterns)),
    }
)
