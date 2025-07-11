import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django_asgi_app = get_asgi_application()


from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from api.middleware import TokenAuthMiddleware
from api.routing import websocket_urlpatterns




application = ProtocolTypeRouter({
    'http' : django_asgi_app,
    'websocket' : AllowedHostsOriginValidator(
        TokenAuthMiddleware(URLRouter(websocket_urlpatterns))
    ),
})