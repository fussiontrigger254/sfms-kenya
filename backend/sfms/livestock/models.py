import uuid
from django.db import models
from farms.models import Farm


class Animal(models.Model):

    class AnimalType(models.TextChoices):
        DAIRY_COW  = 'dairy_cow',  'Dairy Cow'
        BEEF_COW   = 'beef_cow',   'Beef Cow'
        GOAT       = 'goat',       'Goat'
        SHEEP      = 'sheep',      'Sheep'
        CHICKEN    = 'chicken',    'Chicken'
        PIG        = 'pig',        'Pig'
        OTHER      = 'other',      'Other'

    class Gender(models.TextChoices):
        MALE   = 'male',   'Male'
        FEMALE = 'female', 'Female'

    class Status(models.TextChoices):
        ACTIVE   = 'active',   'Active'
        SOLD     = 'sold',     'Sold'
        DECEASED = 'deceased', 'Deceased'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm        = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='animals')
    animal_tag  = models.CharField(max_length=50, help_text='e.g. COW-001, GOAT-12')
    animal_type = models.CharField(max_length=50, choices=AnimalType.choices)
    breed       = models.CharField(max_length=100, blank=True, help_text='e.g. Friesian, Ayrshire, Galla Goat')
    birth_date  = models.DateField(null=True, blank=True)
    gender      = models.CharField(max_length=10, choices=Gender.choices)
    weight_kg   = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    photo_url   = models.URLField(max_length=500, blank=True)
    status      = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    notes       = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['animal_tag']

    def __str__(self):
        return f"{self.animal_tag} — {self.animal_type} ({self.farm.farm_name})"


class HealthRecord(models.Model):

    class RecordType(models.TextChoices):
        VACCINATION = 'vaccination', 'Vaccination'
        DEWORMING   = 'deworming',   'Deworming'
        TREATMENT   = 'treatment',   'Treatment'
        CHECKUP     = 'checkup',     'Checkup'

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal          = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='health_records')
    record_type     = models.CharField(max_length=20, choices=RecordType.choices)
    product_used    = models.CharField(max_length=200, blank=True, help_text='e.g. Ivermectin, Blackleg vaccine')
    date_given      = models.DateField()
    next_due_date   = models.DateField(null=True, blank=True)
    administered_by = models.CharField(max_length=150, blank=True, help_text='Farmer or vet name')
    notes           = models.TextField(blank=True)
    # Expansion hooks — add cost_kes, batch_number, side_effects in Phase 2
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_given']

    def __str__(self):
        return f"{self.record_type} — {self.animal.animal_tag} on {self.date_given}"