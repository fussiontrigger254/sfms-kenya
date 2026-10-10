# backend/sfms/farms/serializers.py
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Farm, SoilLog, Task


class FarmSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(
        required=False,
        validators=[UniqueValidator(queryset=Farm.objects.all())],
    )
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
        read_only_fields = ['created_at']


class SoilLogSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(
        required=False,
        validators=[UniqueValidator(queryset=SoilLog.objects.all())],
    )
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
        read_only_fields = ['created_at']


class TaskSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(
        required=False,
        validators=[UniqueValidator(queryset=Task.objects.all())],
    )
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