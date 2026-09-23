from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/farms/', include('farms.urls')),
    path('api/', include('crops.urls')),
    path('api/', include('livestock.urls')),
    path('api/financials/', include('financials.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/notifications/', include('notifications.urls')), 
    path('api/community/', include('community.urls')),
]
