import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter
from channels.auth import AuthMiddlewareStack
from wsocket.consumers import PresenceConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_websockets.settings')

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            PresenceConsumer.as_asgi()
        ),
    }
)
