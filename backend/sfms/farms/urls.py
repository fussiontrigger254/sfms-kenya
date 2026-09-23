# backend/sfms/farms/urls.py
from django.urls import path
from .views import FarmListCreateView, FarmDetailView, SoilLogListCreateView, SoilLogDetailView

urlpatterns = [
    path('', FarmListCreateView.as_view(), name='farm-list-create'),
    path('<uuid:pk>/', FarmDetailView.as_view(), name='farm-detail'),
    path('soil-logs/', SoilLogListCreateView.as_view(), name='soil-log-list-create'),
    path('soil-logs/<uuid:pk>/', SoilLogDetailView.as_view(), name='soil-log-detail'),
]