from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

from .dashboard import DashboardSummaryView


def health(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('health/', health, name='health'),
    path('admin/', admin.site.urls),
    path('api/dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('api/farms/', include('farms.urls')),
    path('api/', include('crops.urls')),
    path('api/', include('livestock.urls')),
    path('api/financials/', include('financials.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/community/', include('community.urls')),
    path('api/weather/', include('weather.urls')),
]
