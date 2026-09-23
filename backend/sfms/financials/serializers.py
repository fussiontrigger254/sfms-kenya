from rest_framework import serializers

from crops.models import Crop
from farms.models import Farm
from livestock.models import Animal

from .models import FinancialRecord


class FinancialRecordSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(
        source="farm.farm_name",
        read_only=True,
    )

    crop_name = serializers.CharField(
        source="linked_crop.crop_name",
        read_only=True,
        allow_null=True,
    )

    animal_tag = serializers.CharField(
        source="linked_livestock.animal_tag",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = FinancialRecord
        fields = [
            "id",
            "farm",
            "farm_name",
            "type",
            "category",
            "amount",
            "date",
            "description",
            "linked_crop",
            "crop_name",
            "linked_livestock",
            "animal_tag",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "farm_name",
            "crop_name",
            "animal_tag",
            "created_at",
        ]

    def validate_farm(self, farm):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            if farm.user_id != request.user.id:
                raise serializers.ValidationError(
                    "You can only use your own farm."
                )

        return farm

    def validate(self, attrs):
        request = self.context.get("request")

        farm = attrs.get(
            "farm",
            getattr(self.instance, "farm", None),
        )

        crop = attrs.get(
            "linked_crop",
            getattr(self.instance, "linked_crop", None),
        )

        livestock = attrs.get(
            "linked_livestock",
            getattr(self.instance, "linked_livestock", None),
        )

        if request and request.user.is_authenticated:
            if farm and farm.user_id != request.user.id:
                raise serializers.ValidationError(
                    {"farm": "This farm does not belong to you."}
                )

        if crop:
            if farm and crop.farm_id != farm.id:
                raise serializers.ValidationError(
                    {
                        "linked_crop":
                        "The selected crop does not belong to this farm."
                    }
                )

        if livestock:
            if farm and livestock.farm_id != farm.id:
                raise serializers.ValidationError(
                    {
                        "linked_livestock":
                        "The selected livestock does not belong to this farm."
                    }
                )

        amount = attrs.get("amount")

        if amount is not None and amount <= 0:
            raise serializers.ValidationError(
                {"amount": "Amount must be greater than zero."}
            )

        return attrs