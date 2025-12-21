from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicInnovationViewSet
from . import views


router = DefaultRouter(trailing_slash=True)
router = DefaultRouter()
router.register(r'public-lists', PublicInnovationViewSet, basename='innovation-public')
app_name = 'innovations'


urlpatterns = [
    path('innovations/create/', views.create_innovation),
    path('my-innovations/', views.my_innovations),
    path('innovations/', include(router.urls)),
path('innovation/<int:id>/', views.InnovationDetailView.as_view(), name='innovation-detail'),
    path('innovations/public-countss/', views.PublicCountsView.as_view(), name='public-counts'),
]
