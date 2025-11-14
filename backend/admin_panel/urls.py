
from django.urls import path
from . import views

urlpatterns = [
path('admin/dashboard/', views.admin_dashboard),
path('admin/upload/<int:pk>/update/', views.update_status),
path('admin/users/', views.list_users),
path('admin/users/create/', views.create_user),
path('admin/users/<int:pk>/', views.manage_user),
path('admin/events/', views.manage_events),
path('admin/events/<int:pk>/', views.event_detail),
path('admin/events/create/', views.create_event),
path('admin/users/create/', views.create_user_admin),
]