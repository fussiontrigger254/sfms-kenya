# backend/sfms/farms/urls.py
from django.urls import path
from .views import (
    FarmListCreateView, FarmDetailView,
    SoilLogListCreateView, SoilLogDetailView,
    TaskListCreateView, TaskDetailView,
)

urlpatterns = [
    path('', FarmListCreateView.as_view(), name='farm-list-create'),
    path('<uuid:pk>/', FarmDetailView.as_view(), name='farm-detail'),
    path('soil-logs/', SoilLogListCreateView.as_view(), name='soil-log-list-create'),
    path('soil-logs/<uuid:pk>/', SoilLogDetailView.as_view(), name='soil-log-detail'),
    path('tasks/', TaskListCreateView.as_view(), name='task-list-create'),
    path('tasks/<uuid:pk>/', TaskDetailView.as_view(), name='task-detail'),
]