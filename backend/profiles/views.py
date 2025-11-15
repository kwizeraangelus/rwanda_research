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





from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_contact(request):
    name = request.data.get('name')
    email = request.data.get('email')
    subject = request.data.get('subject')
    message = request.data.get('message')

    if not all([name, email, subject, message]):
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    # Email content
    email_body = f"""
    New Contact Message

    Name: {name}
    Email: {email}
    Subject: {subject}

    Message:
    {message}
    """

    try:
        send_mail(
            subject=f"[Research Hub] {subject}",
            message=email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['kwizeraangelus6@gmail.com'],  # Your email
            fail_silently=False,
        )
        return Response({"message": "Thank you! Your message has been sent."}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return Response({"error": "Failed to send message. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)