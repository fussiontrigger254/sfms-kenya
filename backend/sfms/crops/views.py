from django.shortcuts import render
import logging
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from .models import Crop, SprayLog, HarvestLog
from .serializers import CropSerializer, SprayLogSerializer, HarvestLogSerializer
from .services import SprayService

logger = logging.getLogger(__name__)


class CropViewSet(viewsets.ModelViewSet):
    """
    CRUD for crops.
    Farmers only see crops belonging to their own farms.
    """
    serializer_class   = CropSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Crop.objects.filter(
            farm__user=self.request.user
        ).select_related('farm').prefetch_related('spray_logs', 'harvest_logs')


class SprayLogViewSet(viewsets.ModelViewSet):
    """
    Logging a spray triggers SprayService:
    - Updates Crop.last_spray_date
    - Recalculates Crop.next_spray_date
    - Creates Notification record
    """
    serializer_class   = SprayLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SprayLog.objects.filter(
            crop__farm__user=self.request.user
        ).select_related('crop__farm')

    def perform_create(self, serializer):
        crop       = serializer.validated_data['crop']
        spray_date = serializer.validated_data['spray_date']
        product    = serializer.validated_data.get('product_used', '')
        notes      = serializer.validated_data.get('notes', '')

        # Delegate to service — no business logic in views
        SprayService.log_spray(crop, spray_date, product, notes)

        logger.info(
            f"[View] Spray logged for {crop.crop_name} "
            f"by {self.request.user.username}"
        )


class HarvestLogViewSet(viewsets.ModelViewSet):
    """
    Records actual vs expected yield per crop.
    yield_variance_kg calculated automatically in serializer.
    """
    serializer_class   = HarvestLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HarvestLog.objects.filter(
            crop__farm__user=self.request.user
        ).select_related('crop__farm')

# Create your views here.
