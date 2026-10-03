from datetime import date
from django.contrib.auth import get_user_model
from django.test import TestCase
from farms.models import Farm
from .models import Animal, HealthRecord
from .services import HealthService

User = get_user_model()


class LivestockTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='livestock-test')
        self.farm = Farm.objects.create(user=self.user, farm_name='Test Farm', location='Nakuru', farm_size=2, farm_type='livestock')
        self.animal = Animal.objects.create(farm=self.farm, animal_tag='COW-001', animal_type=Animal.AnimalType.DAIRY_COW, gender=Animal.Gender.FEMALE)

    def test_health_service_calculates_deworming_date(self):
        record = HealthService.log_health_record(self.animal, HealthRecord.RecordType.DEWORMING, date(2026, 1, 1))
        self.assertEqual(record.next_due_date, date(2026, 4, 1))
        self.assertEqual(record.animal, self.animal)
