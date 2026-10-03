from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from farms.models import Farm
from .models import Crop
from .serializers import CropSerializer

User = get_user_model()


class CropTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='crop-test')
        self.farm = Farm.objects.create(user=self.user, farm_name='Test Farm', location='Nakuru', farm_size=2, farm_type='crop')

    def test_crop_defaults_to_growing(self):
        crop = Crop.objects.create(farm=self.farm, crop_name='Maize', planting_date=date.today(), plot_size=1, season=Crop.Season.LONG_RAINS)
        self.assertEqual(crop.status, Crop.Status.GROWING)

    def test_days_to_next_spray(self):
        crop = Crop.objects.create(farm=self.farm, crop_name='Maize', planting_date=date.today(), plot_size=1, season=Crop.Season.LONG_RAINS, next_spray_date=date.today() + timedelta(days=3))
        self.assertEqual(CropSerializer(crop).data['days_to_next_spray'], 3)
