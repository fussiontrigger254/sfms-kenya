# backend/sfms/weather/urls.py
from django.urls import path
from .views import FarmWeatherView

urlpatterns = [
    path('<uuid:farm_id>/', FarmWeatherView.as_view(), name='farm-weather'),
]