from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnimalViewSet, HealthRecordViewSet

router = DefaultRouter()
router.register(r'animals', AnimalViewSet,       basename='animal')
router.register(r'health',  HealthRecordViewSet, basename='health')

urlpatterns = [
    path('', include(router.urls)),
]