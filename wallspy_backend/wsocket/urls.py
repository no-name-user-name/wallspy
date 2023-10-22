from django.urls import path, include

from . import consumers


urlpatterns = [
    path("", consumers.PresenceConsumer.as_asgi()),
]