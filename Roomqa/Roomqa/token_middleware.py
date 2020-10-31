from channels.auth import AuthMiddlewareStack
from django.contrib.auth.models import AnonymousUser
import jwt
from django.contrib.auth import get_user_model
from rest_framework import exceptions
from channels.db import database_sync_to_async
from django.utils.translation import ugettext as _
from rest_framework_jwt.settings import api_settings

jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
jwt_get_username_from_payload = api_settings.JWT_PAYLOAD_GET_USERNAME_HANDLER

@database_sync_to_async
def get_user(username):
    try:
        return get_user_model().objects.get(username=username)
    except:
        return AnonymousUser

def authenticate_credentials(payload):
        """
        Returns an active user that matches the payload's user id and email.
        """
        username = jwt_get_username_from_payload(payload)
        return username

def authenticate(jwt_value):
        """
        Returns a two-tuple of `User` and token if a valid signature has been
        supplied using JWT-based authentication.  Otherwise returns `None`.
        """
        if jwt_value is None:
            return None

        try:
            payload = jwt_decode_handler(jwt_value)
        except jwt.ExpiredSignature:
            msg = _('Signature has expired.')
            raise exceptions.AuthenticationFailed(msg)
        except jwt.DecodeError:
            msg = _('Error decoding signature.')
            raise exceptions.AuthenticationFailed(msg)
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed()

        username = authenticate_credentials(payload)

        return username

class TokenAuthMiddleware:
    """
    Token authorization middleware for Django Channels 2
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        token = None
        for i in scope['headers']:
          if i[0] == b'cookie':
            for j in i[1].split(b'; '):
              if j[:5] == b'token':
                token = j[6:]
        username = authenticate(token)
        user = await get_user(username)
        scope['user'] = user
        return await self.app(scope, receive, send)

TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))