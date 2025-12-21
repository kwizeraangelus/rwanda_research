from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import status
from .serializers import InnovationSerializer,InnovationSerializers
from .models import Innovation

# Create your views here.


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_innovations(request):
    innovations = Innovation.objects.filter(innovator=request.user).order_by('-created_at')
    serializer = InnovationSerializer(innovations, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_innovation(request):
    data = request.data.copy()
    data['innovator'] = request.user.id
    
    serializer = InnovationSerializer(data=data)
    if serializer.is_valid():
        serializer.save(innovator=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)










from rest_framework import viewsets, filters
from django.db.models import Count, Q
@permission_classes([AllowAny])
class PublicInnovationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InnovationSerializers
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
       return Innovation.objects.filter(status='approved')
# For counts endpoint
from rest_framework.views import APIView
from rest_framework.response import Response
@permission_classes([AllowAny])
class PublicCountsView(APIView):
    def get(self, request):
        qs = Innovation.objects.filter(status='approved')
        data = {
            'total': qs.count(),
            'sponsored': qs.filter(sponsorship_needed='sponsored').count(),
            'unsponsored': qs.filter(sponsorship_needed='unsponsored').count(),
            'no_need': qs.filter(sponsorship_needed='no-need').count(),
        }
        return Response(data)
    







# innovations/views.py
from rest_framework import generics
from .models import Innovation
from .serializers import InnovationSerializer

# Public detail view - no authentication or permission checks
@permission_classes([AllowAny])
class InnovationDetailView(generics.RetrieveAPIView):
    queryset = Innovation.objects.all()
    serializer_class = InnovationSerializer
    lookup_field = 'id'  # or 'pk'

    # No permission_classes → completely public

