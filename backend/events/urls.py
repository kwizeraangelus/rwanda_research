# urls.py
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('events/', views.public_events, name='public-events'),
    path('innovations/events/', views.event_list, name='event_list'),
    path('admin/events/create/', views.create_event, name='create_event'),
    path('admin/events/<int:event_id>/update/', views.update_event, name='update_event'),
    path('admin/events/<int:event_id>/delete/', views.delete_event, name='delete_event'),



    path('my-events/', views.my_events, name='my_events'),
    path('events/create/', views.create_event, name='create_event'),




    path('admin/events/pending/', views.pending_events_list, name='admin_pending_events'),
    path('admin/events/<int:pk>/approve/', views.approve_event, name='admin_approve_event'),
    path('admin/events/<int:pk>/reject/', views.reject_event, name='admin_reject_event'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)