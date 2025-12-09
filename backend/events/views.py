# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import Event
from .serializers import EventSerializer
from django.utils import timezone
import json

@api_view(['GET'])
@permission_classes([AllowAny])
def public_events(request):
    """Public events (upcoming events only)"""
    events = Event.objects.filter(date__gte=timezone.now()).order_by('date')
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def event_list(request):
    """All events for admin panel"""
    events = Event.objects.all().order_by('-date')
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_event(request):
    """Create new event with photo upload"""
    try:
        # Handle form data (for photo upload)
        data = request.POST.copy()
        files = request.FILES
        
        # Create event instance
        event = Event(
            title=data.get('title', ''),
            description=data.get('description', ''),
            date=data.get('date', ''),
            location=data.get('location', ''),
            icon=data.get('icon', 'Calendar'),
            link=data.get('link', '')
        )
        
        # Handle photo upload
        if 'photo' in files:
            event.photo = files['photo']
        
        event.save()
        
        serializer = EventSerializer(event)
        return Response({
            'message': 'Event created successfully',
            'event': serializer.data
        }, status=201)
        
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_event(request, event_id):
    """Delete an event"""
    try:
        event = Event.objects.get(id=event_id)
        event.delete()
        return Response({'message': 'Event deleted successfully'}, status=200)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_event(request, event_id):
    """Update event including photo"""
    try:
        event = Event.objects.get(id=event_id)
        data = request.POST.copy()
        files = request.FILES
        
        # Update fields
        if 'title' in data:
            event.title = data['title']
        if 'description' in data:
            event.description = data['description']
        if 'date' in data:
            event.date = data['date']
        if 'location' in data:
            event.location = data['location']
        if 'icon' in data:
            event.icon = data['icon']
        if 'link' in data:
            event.link = data['link']
        
        # Handle photo upload/update
        if 'photo' in files:
            event.photo = files['photo']
        elif 'remove_photo' in data and data['remove_photo'] == 'true':
            # Remove existing photo
            event.photo.delete(save=False)
            event.photo = None
        
        event.save()
        
        serializer = EventSerializer(event)
        return Response({
            'message': 'Event updated successfully',
            'event': serializer.data
        }, status=200)
        
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)