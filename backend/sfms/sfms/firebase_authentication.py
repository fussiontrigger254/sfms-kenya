# backend/sfms/sfms/firebase_authentication.py
import os
import json
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions

BASE_DIR = Path(__file__).resolve().parent


def initialize_firebase():
    if firebase_admin._apps:
        return

    cred_value = os.environ.get(
        "FIREBASE_CREDENTIALS",
        "/app/sfms/sfms/serviceAccountKey.json",
    )

    # If it looks like JSON content (starts with '{'), parse it directly —
    # this is how we'll supply it on Render, where there's no file to point to.
    # Otherwise, treat it as a file path — this is the existing local Docker setup.
    stripped = cred_value.strip()
    if stripped.startswith("{"):
        cred_dict = json.loads(stripped)
        cred = credentials.Certificate(cred_dict)
    else:
        cred = credentials.Certificate(cred_value)

    firebase_admin.initialize_app(cred)


class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return None

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