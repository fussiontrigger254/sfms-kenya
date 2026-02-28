import uuid
from django.db import models
from farms.models import Farm


class Crop(models.Model):

    class Status(models.TextChoices):
        GROWING   = 'growing',   'Growing'
        HARVESTED = 'harvested', 'Harvested'
        FAILED    = 'failed',    'Failed'

    class Season(models.TextChoices):
        LONG_RAINS  = 'long_rains',  'Long Rains (Mar–Jun)'
        SHORT_RAINS = 'short_rains', 'Short Rains (Oct–Dec)'
        IRRIGATION  = 'irrigation',  'Irrigation / Dry Season'

    id                    = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm                  = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='crops')
    crop_name             = models.CharField(max_length=150)
    variety               = models.CharField(max_length=150, blank=True)
    planting_date         = models.DateField()
    expected_harvest_date = models.DateField(null=True, blank=True)
    plot_size             = models.DecimalField(max_digits=8, decimal_places=2, help_text='Acres')
    season                = models.CharField(max_length=20, choices=Season.choices)
    status                = models.CharField(max_length=20, choices=Status.choices, default=Status.GROWING)

    # Spray tracking — updated automatically via SprayService
    spray_interval_days   = models.IntegerField(default=14, help_text='Days between sprays')
    last_spray_date       = models.DateField(null=True, blank=True)
    next_spray_date       = models.DateField(null=True, blank=True)

    created_at            = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-planting_date']

    def __str__(self):
        return f"{self.crop_name} ({self.farm.farm_name})"

    def recalculate_next_spray(self):
        """Pure calculation — called by SprayService, never directly."""
        if self.last_spray_date and self.spray_interval_days:
            from datetime import timedelta
            self.next_spray_date = self.last_spray_date + timedelta(days=self.spray_interval_days)


class SprayLog(models.Model):

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    crop         = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='spray_logs')
    spray_date   = models.DateField()
    product_used = models.CharField(max_length=200, blank=True)
    notes        = models.TextField(blank=True)
    # Expansion hooks ↓ — Phase 2 and beyond
    # cost_kes     = models.DecimalField(...)   ← link to FinancialRecord
    # weather_data = models.JSONField(...)      ← from OpenWeather at spray time
    # ai_analysis  = models.TextField(...)     ← pest/disease AI output
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-spray_date']

    def __str__(self):
        return f"Spray on {self.spray_date} → {self.crop.crop_name}"


class HarvestLog(models.Model):

    class QualityGrade(models.TextChoices):
        GRADE_A = 'A',      'Grade A'
        GRADE_B = 'B',      'Grade B'
        GRADE_C = 'C',      'Grade C'
        CUSTOM  = 'custom', 'Custom'

    id                = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    crop              = models.ForeignKey(Crop, on_delete=models.CASCADE, related_name='harvest_logs')
    harvest_date      = models.DateField()
    expected_yield_kg = models.DecimalField(max_digits=10, decimal_places=2)
    actual_yield_kg   = models.DecimalField(max_digits=10, decimal_places=2)
    quality_grade     = models.CharField(max_length=10, choices=QualityGrade.choices, default=QualityGrade.GRADE_A)
    notes             = models.TextField(blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-harvest_date']

    def __str__(self):
        return f"Harvest {self.actual_yield_kg}kg on {self.harvest_date}"