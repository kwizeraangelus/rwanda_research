from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
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
@permission_classes([IsAuthenticated])
@user_passes_test(is_admin)
def create_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    if not all([username, email, password]):
        return Response({'error': 'Missing fields'}, status=400)
    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({'success': True, 'id': user.id})

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