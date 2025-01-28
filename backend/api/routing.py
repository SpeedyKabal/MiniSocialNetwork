from django.urls import re_path
from api.consumer import AsyncChatConsumer, AsyncOnlineConsumer

websocket_urlpatterns = [
    re_path(r"ws/online/", AsyncOnlineConsumer.as_asgi()),
    re_path(r"ws/chat/(?P<roomName>\w+)/$", AsyncChatConsumer.as_asgi()),
]