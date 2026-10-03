# backend/sfms/farms/views.py
from rest_framework import generics, permissions, serializers

from weather.services import (
    GeocodingConfigurationError,
    GeocodingService,
    GeocodingUnavailableError,
    LocationNotFoundError,
)

from .models import Farm, SoilLog, Task
from .serializers import FarmSerializer, SoilLogSerializer, TaskSerializer


class FarmListCreateView(generics.ListCreateAPIView):
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Farm.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        self._save_with_coordinates(serializer)

    def _save_with_coordinates(self, serializer):
        farm = serializer.validated_data
        latitude = farm.get('latitude')
        longitude = farm.get('longitude')

        if latitude is None or longitude is None:
            try:
                latitude, longitude = GeocodingService.geocode(farm.get('location'))
            except GeocodingConfigurationError as exc:
                raise serializers.ValidationError({'location': str(exc)})
            except LocationNotFoundError as exc:
                raise serializers.ValidationError({'location': str(exc)})
            except GeocodingUnavailableError as exc:
                raise serializers.ValidationError({'location': str(exc)})

        serializer.save(
            user=self.request.user,
            latitude=latitude,
            longitude=longitude,
        )


class FarmDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Farm.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        location_changed = 'location' in serializer.validated_data
        coordinates_missing = (
            serializer.validated_data.get('latitude') is None
            or serializer.validated_data.get('longitude') is None
        )

        if location_changed and coordinates_missing:
            try:
                latitude, longitude = GeocodingService.geocode(
                    serializer.validated_data.get('location')
                )
            except (
                GeocodingConfigurationError,
                LocationNotFoundError,
                GeocodingUnavailableError,
            ) as exc:
                raise serializers.ValidationError({'location': str(exc)})

            serializer.save(latitude=latitude, longitude=longitude)
            return

        serializer.save()


class SoilLogListCreateView(generics.ListCreateAPIView):
    serializer_class = SoilLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SoilLog.objects.filter(farm__user=self.request.user).order_by('-test_date')


class SoilLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SoilLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SoilLog.objects.filter(farm__user=self.request.user)


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(farm__user=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(farm__user=self.request.user)
