from rest_framework import serializers
from .models import CommunityPost

class CommunityPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = CommunityPost
        fields = [
            "id", "user", "author_name", "post_type", "title", "body",
            "county", "contact_info", "price_kes", "is_active", "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]