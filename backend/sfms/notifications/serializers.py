# backend/sfms/notifications/serializers.py
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'message',
            'type',
            'channel',
            'due_date',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']