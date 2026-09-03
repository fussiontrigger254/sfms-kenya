import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class CommunityPost(models.Model):
    POST_TYPE_CHOICES = [
        ("produce_listing", "Produce Listing"),
        ("buy_request", "Buy Request"),
        ("notice", "Notice"),
        ("tip", "Tip"),
        ("question", "Question"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    post_type = models.CharField(max_length=30, choices=POST_TYPE_CHOICES)
    title = models.CharField(max_length=300)
    body = models.TextField()
    county = models.CharField(max_length=100, db_index=True)
    contact_info = models.CharField(max_length=200)
    price_kes = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["county", "is_active"]),
            models.Index(fields=["post_type"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.county})"