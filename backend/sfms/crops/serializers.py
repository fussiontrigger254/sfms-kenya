from datetime import date
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Crop, SprayLog, HarvestLog


class SprayLogSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False, validators=[UniqueValidator(queryset=SprayLog.objects.all())])

    class Meta:
        model  = SprayLog
        fields = [
            'id', 'crop', 'spray_date',
            'product_used', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']


class HarvestLogSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False, validators=[UniqueValidator(queryset=HarvestLog.objects.all())])
    yield_variance_kg = serializers.SerializerMethodField()

    class Meta:
        model  = HarvestLog
        fields = [
            'id', 'crop', 'harvest_date',
            'expected_yield_kg', 'actual_yield_kg',
            'yield_variance_kg', 'quality_grade',
            'notes', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_yield_variance_kg(self, obj):
        """Positive = exceeded target. Negative = underperformed."""
        return float(obj.actual_yield_kg - obj.expected_yield_kg)


class CropSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False, validators=[UniqueValidator(queryset=Crop.objects.all())])
    spray_logs         = SprayLogSerializer(many=True, read_only=True)
    harvest_logs       = HarvestLogSerializer(many=True, read_only=True)
    days_to_next_spray = serializers.SerializerMethodField()

    class Meta:
        model  = Crop
        fields = [
            'id', 'farm', 'crop_name', 'variety',
            'planting_date', 'expected_harvest_date',
            'plot_size', 'season', 'status',
            'spray_interval_days', 'last_spray_date',
            'next_spray_date', 'days_to_next_spray',
            'spray_logs', 'harvest_logs',
            'created_at',
        ]
        read_only_fields = [
            'last_spray_date',
            'next_spray_date', 'created_at'
        ]

    def get_days_to_next_spray(self, obj):
        """
        Positive = days remaining.
        Zero     = due today.
        Negative = overdue.
        """
        if not obj.next_spray_date:
            return None
        return (obj.next_spray_date - date.today()).days