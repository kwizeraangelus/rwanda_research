

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from .models import CustomUser
from .serializers import *
from django.conf import settings
from rest_framework.permissions import AllowAny,IsAuthenticated

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserProfileSerializer(data=request.data)
        if serializer.is_valid():
            user = CustomUser.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=request.data.get('password'),  # Raw password → hashed
                first_name=serializer.validated_data.get('first_name', ''),   # ← Added
                last_name=serializer.validated_data.get('last_name', ''),
                phone_number=serializer.validated_data.get('phone_number'),
                user_category=serializer.validated_data.get('user_category'),
                university_name=serializer.validated_data.get('university_name') if serializer.validated_data.get('user_category') == 'university' else None
            )
            return Response({'message': 'Registration successful'}, status=status.HTTP_201_CREATED)
        else:
            print("Validation errors:", serializer.errors)  # ← Debug
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

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

        redirect_to = '/'
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
        elif user.user_category == 'innovator':
            redirect_to = '/innovator'

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















@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data

    user = CustomUser.objects.create_user(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
    )

    # Custom field if your User model has it
    user.user_category = data.get('user_category', '')
    user.save()

    return Response({
        "message": "User created",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "user_category": user.user_category,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserProfileSerializer(user).data
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    return Response(UserProfileSerializer(request.user).data)








from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated

class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password1 = request.data.get('new_password1')
        new_password2 = request.data.get('new_password2')

        if not all([old_password, new_password1, new_password2]):
            return Response({"detail": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({"old_password": ["Current password is incorrect"]}, status=status.HTTP_400_BAD_REQUEST)

        if new_password1 != new_password2:
            return Response({"new_password2": ["The two new password fields didn't match"]}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password1) < 8:
            return Response({"new_password1": ["This password is too short. It must contain at least 8 characters."]}, status=status.HTTP_400_BAD_REQUEST)

        # You can add more validation here (e.g. common password check)

        user.set_password(new_password1)
        user.save()
        update_session_auth_hash(request, user)  # Keeps the user logged in

        return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)
















