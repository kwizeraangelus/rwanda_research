# users/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings

class JWTCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # 1. Try header first
        header = self.get_header(request)
        if header:
            return super().authenticate(request)

        # 2. Try cookie
        raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, TokenError):
            return None