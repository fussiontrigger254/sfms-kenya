from datetime import timedelta

from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from crops.models import Crop
from farms.models import Farm, Task
from financials.models import FinancialRecord
from livestock.models import HealthRecord

DUE_WINDOW_DAYS = 7
MAX_ITEMS = 5


class DashboardSummaryView(APIView):
    """GET /api/dashboard/summary/?farm_id=<uuid>  (farm_id optional)"""

    def get(self, request):
        today = timezone.localdate()
        soon = today + timedelta(days=DUE_WINDOW_DAYS)

        farms = Farm.objects.filter(user=request.user)
        farm_id = request.query_params.get("farm_id")
        if farm_id:
            farms = farms.filter(id=farm_id)

        # --- Sprays due (growing crops only; overdue included) ---
        crops = (
            Crop.objects.filter(
                farm__in=farms,
                status=Crop.Status.GROWING,
                next_spray_date__isnull=False,
                next_spray_date__lte=soon,
            )
            .select_related("farm")
            .order_by("next_spray_date")[:MAX_ITEMS]
        )
        sprays = [
            {
                "crop_id": str(c.id),
                "crop_name": c.crop_name,
                "farm_name": c.farm.farm_name,
                "due_date": c.next_spray_date,
                "days_left": (c.next_spray_date - today).days,
            }
            for c in crops
        ]

        # --- Health due: only the LATEST record per animal + type counts ---
        records = (
            HealthRecord.objects.filter(
                animal__farm__in=farms,
                animal__status="active",
                next_due_date__isnull=False,
            )
            .select_related("animal")
            .order_by("animal_id", "record_type", "-date_given")
        )
        latest, seen = [], set()
        for r in records:
            key = (r.animal_id, r.record_type)
            if key in seen:
                continue
            seen.add(key)
            if r.next_due_date <= soon:
                latest.append(r)
        latest.sort(key=lambda r: r.next_due_date)
        health = [
            {
                "animal_id": str(r.animal_id),
                "animal_tag": r.animal.animal_tag,
                "record_type": r.record_type,
                "due_date": r.next_due_date,
                "days_left": (r.next_due_date - today).days,
            }
            for r in latest[:MAX_ITEMS]
        ]

        # --- Tasks pending and due today or earlier ---
        tasks_qs = Task.objects.filter(
            farm__in=farms, status="pending",
        ).filter(
            Q(due_date__isnull=True) | Q(due_date__lte=today)
        ).order_by("due_date")[:MAX_ITEMS]
        tasks = [
            {"task_id": str(t.id), "title": t.title, "due_date": t.due_date}
            for t in tasks_qs
        ]

        # --- This month's profit / loss ---
        month = FinancialRecord.objects.filter(
            farm__in=farms, date__year=today.year, date__month=today.month
        )
        revenue = month.filter(type=FinancialRecord.TYPE_REVENUE).aggregate(t=Sum("amount"))["t"] or 0
        expense = month.filter(type=FinancialRecord.TYPE_EXPENSE).aggregate(t=Sum("amount"))["t"] or 0

        return Response({
            "today": today,
            "farm_count": farms.count(),
            "sprays": sprays,
            "health": health,
            "tasks": tasks,
            "month": {
                "label": today.strftime("%B %Y"),
                "revenue": revenue,
                "expense": expense,
                "net": revenue - expense,
            },
        })