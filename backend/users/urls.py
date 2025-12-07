from django.urls import path
from .views import RegisterView,LoginView,signup_view,login_view,profile_view

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),





    path('signup/', signup_view),
    path('logins/', login_view),
    path('profile/', profile_view),
]