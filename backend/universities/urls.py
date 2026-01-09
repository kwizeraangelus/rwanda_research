from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResearcherViewSet, PublicationViewSet

router = DefaultRouter()
# Register with singular 'researcher' to match frontend calls
router.register(r'researcher', ResearcherViewSet, basename='researcher')
router.register(r'publications', PublicationViewSet, basename='publication')

urlpatterns = [
    path('', include(router.urls)),
]