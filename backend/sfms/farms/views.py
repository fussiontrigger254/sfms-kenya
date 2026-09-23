# backend/sfms/farms/views.py
from rest_framework import generics, permissions
from .models import Farm, SoilLog
from .serializers import FarmSerializer, SoilLogSerializer


class FarmListCreateView(generics.ListCreateAPIView):
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Farm.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FarmDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Farm.objects.filter(user=self.request.user)


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