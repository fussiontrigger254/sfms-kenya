# backend/sfms/farms/models.py
from django.db import models
from django.contrib.auth.models import User
import uuid


class Farm(models.Model):
    FARM_TYPES = [
        ('crop', 'Crop'),
        ('livestock', 'Livestock'),
        ('mixed', 'Mixed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    farm_name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    farm_size = models.DecimalField(max_digits=6, decimal_places=2)
    farm_type = models.CharField(max_length=20, choices=FARM_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.farm_name


class SoilLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='soil_logs')
    test_date = models.DateField()
    ph_level = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    soil_type = models.CharField(max_length=100, blank=True, help_text='e.g. Clay, Loam, Sandy')
    last_fertilised = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-test_date']

    def __str__(self):
        return f"Soil test {self.test_date} — {self.farm.farm_name}"


class Task(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('one_time', 'One-time'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=300, help_text='e.g. Water cattle, Check spray tank')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    due_date = models.DateField(null=True, blank=True, help_text='For one-time tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['status', 'due_date']

    def __str__(self):
        return f"{self.title} ({self.farm.farm_name})"