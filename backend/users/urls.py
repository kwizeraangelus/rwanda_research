from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('nova/login/', views.LoginView.as_view(), name='login'),





    path('signup/', views.register_user),
    path('login/', views.login_view),
    path('profile/', views.profile_view),


]