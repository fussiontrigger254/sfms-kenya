# backend/sfms/farms/serializers.py
from rest_framework import serializers
from .models import Farm, SoilLog, Task


class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = [
            'id',
            'farm_name',
            'location',
            'latitude',
            'longitude',
            'farm_size',
            'farm_type',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class SoilLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilLog
        fields = [
            'id',
            'farm',
            'test_date',
            'ph_level',
            'soil_type',
            'last_fertilised',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id',
            'farm',
            'title',
            'frequency',
            'due_date',
            'status',
            'notes',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']