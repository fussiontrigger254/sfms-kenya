from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth
from django.contrib.auth import get_user_model

User = get_user_model()

class FirebaseAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]

        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token['uid']
        except Exception:
            raise AuthenticationFailed("Invalid Firebase token")

        user, created = User.objects.get_or_create(username=uid)

        return (user, None)