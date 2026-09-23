from django.contrib import admin

from .models import FinancialRecord


@admin.register(FinancialRecord)
class FinancialRecordAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "farm",
        "type",
        "category",
        "amount",
        "linked_crop",
        "linked_livestock",
    )

    list_filter = (
        "type",
        "category",
        "date",
    )

    search_fields = (
        "category",
        "description",
        "farm__farm_name",
    )

    ordering = (
        "-date",
        "-created_at",
    )