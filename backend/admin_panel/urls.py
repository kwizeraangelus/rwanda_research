
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import InnovationAdminViewSet



router = DefaultRouter()
router.register(r'innovations', InnovationAdminViewSet, basename='innovation')

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
path('admin/innovations/approved/', views.approved_innovations),
path('admin/innovations/<int:id>/update/', views.update_innovation),
path('admin/innovations/<int:id>/delete/', views.delete_innovation),


path('admin/', include(router.urls)),





path('admin/users/<uuid:user_id>/update/', views.update_user, name='update_user'),
path('admin/users/<uuid:user_id>/delete/', views.delete_user, name='delete_user'),
]