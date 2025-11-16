from django.urls import path
from . import views

urlpatterns = [
  path('events/', views.public_events, name='public-events'),
  path('innovations/events/', views.event_list, name='event_list'),
]
