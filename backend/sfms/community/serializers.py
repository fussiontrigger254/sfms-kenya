from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import CommunityPost

class CommunityPostSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(
        required=False,
        validators=[UniqueValidator(queryset=CommunityPost.objects.all())],
    )
    author_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = CommunityPost
        fields = [
            "id", "user", "author_name", "post_type", "title", "body",
            "county", "contact_info", "price_kes", "is_active", "created_at",
        ]
        read_only_fields = ["user", "created_at"]