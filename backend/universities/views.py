from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import ResearchProfile, AcademicPlatform, Publication
from .serializers import ResearcherSerializer, PlatformSerializer, PublicationSerializer

class ResearcherViewSet(viewsets.ModelViewSet):
    queryset = ResearchProfile.objects.all()
    serializer_class = ResearcherSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        """Return only the researcher profile of the authenticated user"""
        return ResearchProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """Get or update the authenticated user's researcher profile"""
        # Get or create researcher profile for the authenticated user
        researcher, created = ResearchProfile.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(researcher)
            return Response(serializer.data)
        
        elif request.method in ['PATCH', 'PUT']:
            # Handle file uploads separately
            data = request.data.copy()
            
            # Remove platforms from data as they're handled separately
            if 'academic_platforms' in data:
                data.pop('academic_platforms')
            
            serializer = self.get_serializer(researcher, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='platforms')
    def add_platform(self, request):
        """Add a new academic platform"""
        researcher = get_object_or_404(ResearchProfile, user=request.user)
        platform_id = request.data.get('platform_id')
        
        if not platform_id:
            return Response(
                {'error': 'platform_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if platform already exists
        if AcademicPlatform.objects.filter(research_profile=researcher, platform_id=platform_id).exists():
            return Response(
                {'error': 'Platform already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        platform = AcademicPlatform.objects.create(
            research_profile=researcher,
            platform_id=platform_id
        )
        
        return Response(
            PlatformSerializer(platform).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['delete'], url_path='platforms/(?P<platform_id>[^/.]+)')
    def remove_platform(self, request, platform_id=None):
        """Remove an academic platform"""
        researcher = get_object_or_404(ResearchProfile, user=request.user)
        platform = get_object_or_404(
            AcademicPlatform, 
            research_profile=researcher,
            platform_id=platform_id
        )
        platform.delete()
        return Response(
            {'message': 'Platform deleted successfully'},
            status=status.HTTP_200_OK
        )

class PublicationViewSet(viewsets.ModelViewSet):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        """Return publications for the authenticated user only"""
        researcher = get_object_or_404(ResearchProfile, user=self.request.user)
        return Publication.objects.filter(research_profile=researcher)

    def perform_create(self, serializer):
        """Link publication to user's research profile"""
        researcher = get_object_or_404(ResearchProfile, user=self.request.user)
        serializer.save(research_profile=researcher)

    @action(detail=False, methods=['get'])
    def my_publications(self, request):
        """Get all publications for the authenticated user"""
        researcher = get_object_or_404(ResearchProfile, user=request.user)
        publications = Publication.objects.filter(research_profile=researcher)
        serializer = self.get_serializer(publications, many=True)
        return Response(serializer.data)