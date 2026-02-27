from django.db import models
import uuid


class Farm(models.Model):
    FARM_TYPES = [
        ('crop', 'Crop'),
        ('livestock', 'Livestock'),
        ('mixed', 'Mixed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm_name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    farm_size = models.DecimalField(max_digits=6, decimal_places=2)
    farm_type = models.CharField(max_length=20, choices=FARM_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.farm_name
# Create your models here.
