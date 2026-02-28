from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CropViewSet, SprayLogViewSet, HarvestLogViewSet

router = DefaultRouter()
router.register(r'crops',    CropViewSet,      basename='crop')
router.register(r'sprays',   SprayLogViewSet,  basename='spray')
router.register(r'harvests', HarvestLogViewSet, basename='harvest')

urlpatterns = [
    path('', include(router.urls)),
]