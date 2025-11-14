

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import UserProfileSerializer
from django.conf import settings
from rest_framework.permissions import AllowAny

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            user = CustomUser.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=request.data.get('password'),  # Raw password → hashed
                phone_number=serializer.validated_data.get('phone_number'),
                user_category=serializer.validated_data.get('user_category'),
                university_name=serializer.validated_data.get('university_name') if serializer.validated_data.get('user_category') == 'university' else None
            )
            return Response({'message': 'Registration successful'}, status=status.HTTP_201_CREATED)
        else:
            print("Validation errors:", serializer.errors)  # ← Debug
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# users/views.py
class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password required'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=401)

        user = authenticate(username=email, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=401)

        refresh = RefreshToken.for_user(user)

        redirect_to = '/visitor'
        if user.is_staff:
            redirect_to = '/admin-dashboard'
        elif user.user_category == 'researcher':
            redirect_to = '/researcher'
        elif user.user_category == 'university':
            redirect_to = '/university'
        elif user.user_category == 'conf_organizer':
            redirect_to = '/organizer'
        elif user.user_category == 'admin':
            redirect_to = '/admin'

        response = Response({
            'message': 'Login successful',
            'redirect': redirect_to,
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'category': user.user_category,
                'is_admin': user.is_staff,
            }
        }, status=200)

        response.set_cookie(
            key='access_token',
            value=str(refresh.access_token),
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=3600
        )
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=7*24*3600
        )

        return response