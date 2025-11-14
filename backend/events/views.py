# api/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Event
from .serializers import EventSerializer
from django.utils import timezone

@api_view(['GET'])
@permission_classes([AllowAny])  # PUBLIC
def public_events(request):
    events = Event.objects.filter(date__gte=timezone.now()).order_by('date')
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)