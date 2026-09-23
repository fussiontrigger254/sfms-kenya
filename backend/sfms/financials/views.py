from decimal import Decimal

from django.db.models import Sum
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import FinancialRecord
from .serializers import FinancialRecordSerializer


class FinancialRecordViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = FinancialRecord.objects.filter(
            farm__user=user
        ).select_related(
            "farm",
            "linked_crop",
            "linked_livestock",
        )

        farm = self.request.query_params.get("farm")
        record_type = self.request.query_params.get("type")
        category = self.request.query_params.get("category")
        crop = self.request.query_params.get("linked_crop")
        livestock = self.request.query_params.get("linked_livestock")

        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        search = self.request.query_params.get("search")

        if farm:
            queryset = queryset.filter(farm_id=farm)

        if record_type:
            queryset = queryset.filter(type=record_type)

        if category:
            queryset = queryset.filter(category__iexact=category)

        if crop:
            queryset = queryset.filter(linked_crop_id=crop)

        if livestock:
            queryset = queryset.filter(linked_livestock_id=livestock)

        if date_from:
            queryset = queryset.filter(date__gte=date_from)

        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        if search:
            queryset = queryset.filter(
                description__icontains=search
            ) | queryset.filter(
                category__icontains=search
            )

        return queryset.distinct()

    @action(
        detail=False,
        methods=["get"],
        url_path="summary",
    )
    def summary(self, request):
        queryset = self.get_queryset()

        revenue = queryset.filter(
            type=FinancialRecord.TYPE_REVENUE
        ).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0.00")

        expenses = queryset.filter(
            type=FinancialRecord.TYPE_EXPENSE
        ).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0.00")

        net = revenue - expenses

        return Response(
            {
                "total_revenue": revenue,
                "total_expenses": expenses,
                "net_profit": net,
            },
            status=status.HTTP_200_OK,
        )