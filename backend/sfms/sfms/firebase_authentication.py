import os
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions

BASE_DIR = Path(__file__).resolve().parent


def initialize_firebase():
    if firebase_admin._apps:
        return

    cred_path = os.environ.get(
        "FIREBASE_CREDENTIALS",
        "/app/sfms/sfms/serviceAccountKey.json",
    )

    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)


class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return None  # let other auth backends handle it / anonymous if allowed

        id_token = auth_header.split("Bearer ", 1)[1].strip()
        if not id_token:
            raise exceptions.AuthenticationFailed("Empty Firebase token")

        try:
            initialize_firebase()
            decoded = firebase_auth.verify_id_token(id_token)
        except Exception:
            raise exceptions.AuthenticationFailed("Invalid Firebase token")

        uid = decoded.get("uid")
        if not uid:
            raise exceptions.AuthenticationFailed("Invalid Firebase token payload")

        user, _ = User.objects.get_or_create(username=uid)
        return user, None