

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

        

        user = authenticate(username=email, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=401)

        refresh = RefreshToken.for_user(user)

        # GET WHERE THEY WANTED TO GO (from frontend)
        redirect_to = request.data.get('next', '/visitor')  # ← THIS IS THE KEY

        # Only override for non-public users
        if user.user_category != 'public_visitor':
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

        response.set_cookie('access_token', str(refresh.access_token), httponly=True, samesite='Lax', max_age=3600)
        response.set_cookie('refresh_token', str(refresh), httponly=True, samesite='Lax', max_age=7*24*3600)

        return response
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
def signup_view(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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






















# views.py - Updated for CustomUser model
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

User = get_user_model()  # This will get your CustomUser model

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_list(request):
    """Get all users with CustomUser fields"""
    try:
        users = User.objects.all().order_by('-date_joined')
        
        user_data = []
        for user in users:
            user_data.append({
                'id': str(user.id),  # Convert UUID to string
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
                'phone_number': user.phone_number or '',
                'user_category': user.user_category,
                'university_name': user.university_name or '',
                'date_joined': user.date_joined,
                'last_login': user.last_login,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            })
        
        return Response(user_data, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_user(request, user_id):
    """Update CustomUser information"""
    try:
        user = User.objects.get(id=user_id)
        data = request.data
        
        # Update username if provided and unique
        if 'username' in data and data['username'] != user.username:
            if User.objects.filter(username=data['username']).exclude(id=user_id).exists():
                return Response({'error': 'Username already exists'}, status=400)
            user.username = data['username']
        
        # Update email if provided and unique
        if 'email' in data and data['email'] != user.email:
            if User.objects.filter(email=data['email']).exclude(id=user_id).exists():
                return Response({'error': 'Email already exists'}, status=400)
            user.email = data['email']
        
        # Update other fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        
        if 'last_name' in data:
            user.last_name = data['last_name']
        
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
        
        if 'user_category' in data:
            user.user_category = data['user_category']
        
        if 'university_name' in data:
            user.university_name = data['university_name']
        
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        if 'is_staff' in data:
            user.is_staff = data['is_staff']
        
        # Update password if provided
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        user.save()
        
        return Response({
            'message': 'User updated successfully',
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'user_category': user.user_category,
                'university_name': user.university_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff
            }
        }, status=200)
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_user(request, user_id):
    """Delete a CustomUser"""
    try:
        user = User.objects.get(id=user_id)
        
        # Prevent deleting yourself
        if user.id == request.user.id:
            return Response({'error': 'You cannot delete your own account'}, status=400)
        
        username = user.username
        user.delete()
        
        return Response({'message': f'User {username} deleted successfully'}, status=200)
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_user(request):
    """Create a new CustomUser"""
    try:
        data = request.data
        
        # Basic validation
        if not data.get('username'):
            return Response({'error': 'Username is required'}, status=400)
        if not data.get('email'):
            return Response({'error': 'Email is required'}, status=400)
        if not data.get('password'):
            return Response({'error': 'Password is required'}, status=400)
        
        # Check if username or email already exists
        if User.objects.filter(username=data['username']).exists():
            return Response({'error': 'Username already exists'}, status=400)
        if User.objects.filter(email=data['email']).exists():
            return Response({'error': 'Email already exists'}, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone_number=data.get('phone_number', ''),
            user_category=data.get('user_category', 'public_visitor'),
            university_name=data.get('university_name', ''),
            is_active=data.get('is_active', True),
            is_staff=data.get('user_category') == 'admin' or data.get('is_staff', False)
        )
        
        return Response({
            'message': 'User created successfully',
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone_number': user.phone_number,
                'user_category': user.user_category,
                'university_name': user.university_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff
            }
        }, status=201)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)