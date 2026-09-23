from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from farms.models import Farm

from .models import FinancialRecord


User = get_user_model()


class FinancialRecordModelTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="financial-test-user",
        )

        self.farm = Farm.objects.create(
            user=self.user,
            farm_name="Test Farm",
            location="Nandi",
            farm_size=2,
            farm_type="mixed",
        )

    def test_create_expense(self):
        record = FinancialRecord.objects.create(
            farm=self.farm,
            type=FinancialRecord.TYPE_EXPENSE,
            category="Fertiliser",
            amount=Decimal("2500.00"),
            date="2026-09-23",
            description="DAP fertiliser",
        )

        self.assertEqual(record.amount, Decimal("2500.00"))
        self.assertEqual(record.type, "expense")

    def test_create_revenue(self):
        record = FinancialRecord.objects.create(
            farm=self.farm,
            type=FinancialRecord.TYPE_REVENUE,
            category="Crop Sale",
            amount=Decimal("15000.00"),
            date="2026-09-23",
            description="Maize sale",
        )

        self.assertEqual(record.amount, Decimal("15000.00"))
        self.assertEqual(record.type, "revenue")