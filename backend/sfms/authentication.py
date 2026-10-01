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

        name = (decoded.get("name") or "").strip()
        email = decoded.get("email") or ""
        first, _, last = name.partition(" ")

        user, created = User.objects.get_or_create(
            username=uid,
            defaults={"email": email, "first_name": first[:150], "last_name": last[:150]},
        )

        # Backfill existing users who were created with only a UID
        changed = False
        if email and not user.email:
            user.email, changed = email, True
        if first and not user.first_name:
            user.first_name, user.last_name, changed = first[:150], last[:150], True
        if changed:
            user.save(update_fields=["email", "first_name", "last_name"])

        return user, None