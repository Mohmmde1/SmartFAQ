import logging
from urllib.parse import parse_qs

import jwt
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token

logger = logging.getLogger(__name__)

User = get_user_model()

@database_sync_to_async
def get_user(token_key: str) -> User:
    # Try JWT token first
    try:
        payload = jwt.decode(
            token_key,
            settings.SECRET_KEY,
            algorithms=[settings.SIMPLE_JWT['ALGORITHM']]
        )

        user_id = payload.get('user_id')
        if user_id:
            return User.objects.get(id=user_id)
    except (jwt.InvalidTokenError, User.DoesNotExist):
        pass

    # Fallback to Token authentication
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        pass

    return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:
            # Parse query string properly
            query_string = scope.get('query_string', b'').decode()
            query_params = parse_qs(query_string)
            token_key = query_params.get('token', [None])[0]

            # Set user in scope
            scope['user'] = await get_user(token_key) if token_key else AnonymousUser()
        except Exception:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)
