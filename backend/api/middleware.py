# api/middleware.py
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import AuthenticationFailed
import logging


logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user(token):
    try:
        # Decode the token and retrieve the user
        access_token = AccessToken(token)
        user_id = access_token.payload.get('user_id')
        if user_id is not None:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=user_id)
            logger.info(f"Authenticated user: {user}")
            return user
        else:
            logger.warning("Invalid token payload")
            return AnonymousUser()
    except Exception as e:
        logger.error(f"Error during token authentication: {e}")
        return AnonymousUser()

class TokenAuthMiddleware:
    """
    Custom middleware that authenticates users based on a token query parameter.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Extract the token from the query string
        query_string = scope["query_string"].decode("utf-8")
        token_param = dict(pair.split('=') for pair in query_string.split('&') if '=' in pair).get("token", None)

        if token_param:
            scope['user'] = await get_user(token_param)
        else:
            logger.warning("No token provided in WebSocket URL")
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)