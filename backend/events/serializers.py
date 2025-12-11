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
    


from rest_framework import serializers
from .models import Event

class EventSerializers(serializers.ModelSerializer):
    photo = serializers.ImageField(allow_empty_file=True, required=False)
    organizer = serializers.StringRelatedField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['organizer', 'created_at', 'updated_at', 'status_display']