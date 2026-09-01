from django.shortcuts import render

import logging
from rest_framework import viewsets, permissions
from .models import Animal, HealthRecord
from .serializers import AnimalSerializer, HealthRecordSerializer
from .services import HealthService

logger = logging.getLogger(__name__)


class AnimalViewSet(viewsets.ModelViewSet):
    """
    CRUD for animals.
    Farmers only see animals belonging to their own farms.
    """
    serializer_class   = AnimalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Animal.objects.filter(
            farm__user=self.request.user
        ).select_related('farm').prefetch_related('health_records')


class HealthRecordViewSet(viewsets.ModelViewSet):
    """
    Logging a health record triggers HealthService:
    - Auto-calculates next_due_date based on record type
    - Creates Notification reminder 3 days before due date
    """
    serializer_class   = HealthRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HealthRecord.objects.filter(
            animal__farm__user=self.request.user
        ).select_related('animal__farm')

    def perform_create(self, serializer):
        animal          = serializer.validated_data['animal']
        record_type     = serializer.validated_data['record_type']
        date_given      = serializer.validated_data['date_given']
        product_used    = serializer.validated_data.get('product_used', '')
        administered_by = serializer.validated_data.get('administered_by', '')
        next_due_date   = serializer.validated_data.get('next_due_date', None)
        notes           = serializer.validated_data.get('notes', '')

        # Delegate to service — no business logic in views
        record = HealthService.log_health_record(
            animal          = animal,
            record_type     = record_type,
            date_given      = date_given,
            product_used    = product_used,
            administered_by = administered_by,
            next_due_date   = next_due_date,
            notes           = notes,
        )
        serializer.instance = record 

        logger.info(
            f"[View] Health record logged for {animal.animal_tag} "
            f"by {self.request.user.username}"
        )
