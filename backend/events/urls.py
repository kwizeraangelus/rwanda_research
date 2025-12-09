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
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)