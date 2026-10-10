from datetime import date
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Animal, HealthRecord


class HealthRecordSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(
        required=False,
        validators=[UniqueValidator(queryset=HealthRecord.objects.all())],
    )
    days_to_next_due = serializers.SerializerMethodField()

    class Meta:
        model  = HealthRecord
        fields = [
            'id', 'animal', 'record_type', 'product_used',
            'date_given', 'next_due_date', 'days_to_next_due',
            'administered_by', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_days_to_next_due(self, obj):
        """
        Positive = days remaining.
        Zero     = due today.
        Negative = overdue.
        """
        if not obj.next_due_date:
            return None
        return (obj.next_due_date - date.today()).days


class AnimalSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(
        required=False,
        validators=[UniqueValidator(queryset=Animal.objects.all())],
    )
    health_records   = HealthRecordSerializer(many=True, read_only=True)
    age_years        = serializers.SerializerMethodField()

    class Meta:
        model  = Animal
        fields = [
            'id', 'farm', 'animal_tag', 'animal_type',
            'breed', 'birth_date', 'age_years',
            'gender', 'weight_kg', 'photo_url',
            'status', 'notes',
            'health_records',
            'created_at',
        ]
        read_only_fields = ['created_at']

    def get_age_years(self, obj):
        """Calculate animal age in years from birth_date."""
        if not obj.birth_date:
            return None
        today = date.today()
        age = today.year - obj.birth_date.year
        # Adjust if birthday hasn't occurred yet this year
        if (today.month, today.day) < (obj.birth_date.month, obj.birth_date.day):
            age -= 1
        return age