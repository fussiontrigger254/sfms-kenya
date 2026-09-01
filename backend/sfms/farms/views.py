from rest_framework import generics
from .models import Farm
from .serializers import FarmSerializer


class FarmListCreateView(generics.ListCreateAPIView):
    queryset = Farm.objects.all().order_by('-created_at')
    serializer_class = FarmSerializer


class FarmDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer