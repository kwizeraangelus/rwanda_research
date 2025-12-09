from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'location', 'photo', 'photo_url', 'icon', 'link', 'created_at']
    
    def get_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        return None