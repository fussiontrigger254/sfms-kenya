from rest_framework.routers import DefaultRouter

from .views import FinancialRecordViewSet


router = DefaultRouter()

router.register(
    r"records",
    FinancialRecordViewSet,
    basename="financial-record",
)

urlpatterns = router.urls