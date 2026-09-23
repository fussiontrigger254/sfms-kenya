import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class FinancialRecord(models.Model):
    TYPE_EXPENSE = "expense"
    TYPE_REVENUE = "revenue"

    TYPE_CHOICES = [
        (TYPE_EXPENSE, "Expense"),
        (TYPE_REVENUE, "Revenue"),
    ]

    EXPENSE_CATEGORIES = [
        "Fertiliser",
        "Feed",
        "Labour",
        "Medicine",
        "Pesticides",
        "Herbicides",
        "Fuel",
        "Transport",
        "Vet",
        "Equipment",
        "Other",
    ]

    REVENUE_CATEGORIES = [
        "Crop Sale",
        "Milk",
        "Eggs",
        "Livestock Sale",
        "Manure",
        "Other",
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    farm = models.ForeignKey(
        "farms.Farm",
        on_delete=models.CASCADE,
        related_name="financial_records",
    )

    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
    )

    category = models.CharField(
        max_length=150,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
    )

    date = models.DateField()

    description = models.TextField(
        blank=True,
    )

    linked_crop = models.ForeignKey(
        "crops.Crop",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="financial_records",
    )

    linked_livestock = models.ForeignKey(
        "livestock.Animal",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="financial_records",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["farm", "date"]),
            models.Index(fields=["farm", "type"]),
            models.Index(fields=["category"]),
        ]

    def __str__(self):
        return f"{self.type.title()} - KES {self.amount} - {self.category}"