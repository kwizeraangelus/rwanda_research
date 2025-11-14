# profile/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.MeView.as_view()),
    path('update/', views.ProfileUpdateView.as_view()),
]