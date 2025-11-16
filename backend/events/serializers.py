from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'location', 'link']





class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['title', 'date', 'location', 'icon']