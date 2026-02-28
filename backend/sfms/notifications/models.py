import uuid
from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):

    class Type(models.TextChoices):
        SPRAY_REMINDER = 'spray_reminder', 'Spray Reminder'
        HEALTH_DUE     = 'health_due',     'Health Due'
        WEATHER_ALERT  = 'weather_alert',  'Weather Alert'
        HARVEST_DUE    = 'harvest_due',    'Harvest Due'
        TASK_DUE       = 'task_due',       'Task Due'

    class Channel(models.TextChoices):
        SMS    = 'sms',    'SMS'
        EMAIL  = 'email',  'Email'
        PUSH   = 'push',   'Push'
        IN_APP = 'in_app', 'In App'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT    = 'sent',    'Sent'
        FAILED  = 'failed',  'Failed'

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message    = models.TextField()
    type       = models.CharField(max_length=30, choices=Type.choices)
    channel    = models.CharField(max_length=20, choices=Channel.choices, default=Channel.SMS)
    due_date   = models.DateField()
    status     = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['due_date']

    def __str__(self):
        return f"{self.type} → {self.user.username} on {self.due_date}"