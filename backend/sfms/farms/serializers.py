# farms/serializers.py
from rest_framework import serializers
from .models import Farm


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