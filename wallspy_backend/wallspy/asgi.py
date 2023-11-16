import os

from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from wsocket.consumers import PresenceConsumer
from wsocket.middleware import TokenAuthMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_websockets.settings')

# application = ProtocolTypeRouter(
#     {
#         "http": get_asgi_application(),
#         "https": get_asgi_application(),
#         "websocket": AuthMiddlewareStack(
#             PresenceConsumer.as_asgi()
#         ),
#     }
# )


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "https": get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        TokenAuthMiddleware(
            PresenceConsumer.as_asgi()
        )
    )
})
