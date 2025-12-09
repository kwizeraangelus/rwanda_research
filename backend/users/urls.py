from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('nova/login/', views.LoginView.as_view(), name='login'),





    path('signup/', views.signup_view),
    path('logins/', views.login_view),
    path('profile/', views.profile_view),

    path('admin/users/<uuid:user_id>/update/', views.update_user, name='update_user'),
    path('admin/users/<uuid:user_id>/delete/', views.delete_user, name='delete_user'),

]