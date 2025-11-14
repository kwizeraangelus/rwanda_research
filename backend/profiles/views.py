# profile/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import ResearcherProfile
from .serializers import ProfileSerializer

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        profile, created = ResearcherProfile.objects.get_or_create(user=request.user)
        return Response(ProfileSerializer(profile).data)

class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request):
        profile, created = ResearcherProfile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)