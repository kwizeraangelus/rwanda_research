from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth.decorators import user_passes_test
from innovations.models import Upload
from .serializers import AdminUploadSerializer
from django.contrib.auth import get_user_model
from events.models import Event
from .serializers import UserSerializer, EventSerializer




User = get_user_model()

def is_admin(user):
    return user.is_staff

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin)
def admin_dashboard(request):
    pending = Upload.objects.filter(status='pending')
    total_users = User.objects.count()
    total_books = Upload.objects.count()
    pending_count = pending.count()

    serializer = AdminUploadSerializer(pending, many=True)
    return Response({
        'kpis': {
            'total_users': total_users,
            'total_books': total_books,
            'pending_count': pending_count,
        },
        'pending': serializer.data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin)
def update_status(request, pk):
    try:
        upload = Upload.objects.get(pk=pk)
        action = request.data.get('action')
        feedback = request.data.get('feedback', '')

        if action == 'approve':
            upload.status = 'approved'
            upload.feedback = ''
        elif action == 'reject':
            upload.status = 'rejected'
            upload.feedback = feedback

        upload.save()
        return Response({'success': True})
    except Upload.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)







User = get_user_model()

def is_admin(user):
    return user.is_staff

# === USERS ===
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin)
def list_users(request):
    users = User.objects.all().order_by('username')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

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

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin)
def manage_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
        if request.method == 'DELETE':
            user.delete()
            return Response({'success': True})
        elif request.method == 'PUT':
            user.username = request.data.get('username', user.username)
            user.email = request.data.get('email', user.email)
            if request.data.get('password'):
                user.set_password(request.data.get('password'))
            user.save()
            return Response({'success': True})
    except User.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

# === EVENTS ===
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin)
def manage_events(request):
    if request.method == 'GET':
        events = Event.objects.all().order_by('-date')
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin)
def event_detail(request, pk):
    try:
        event = Event.objects.get(pk=pk)
        if request.method == 'DELETE':
            event.delete()
            return Response({'success': True})
        elif request.method == 'PUT':
            serializer = EventSerializer(event, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
    except Event.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)





@api_view(['POST'])
@permission_classes([IsAuthenticated])
@user_passes_test(lambda u: u.is_staff)
def create_event(request):
    serializer = EventSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)





from django.contrib.auth.decorators import user_passes_test
from .serializers import AdminUserSerializer

def is_admin(user):
    return user.is_staff

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin)
def create_user_admin(request):
    serializer = AdminUserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'user': serializer.data})
    return Response(serializer.errors, status=400)







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