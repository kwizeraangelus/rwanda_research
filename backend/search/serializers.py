from rest_framework import serializers
from .models import Innovation# serializers.py


class InnovationSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Innovation
        fields = ['id', 'name', 'description', 'photo', 'photo_url', 'status', 'sponsorship_needed','feedback', 'created_at']
        read_only_fields = ['status', 'created_at']

    def get_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        return None
    










# serializers.py
from rest_framework import serializers
from .models import Innovation

class InnovationSerializers(serializers.ModelSerializer):
    photo = serializers.ImageField(use_url=True)  # Returns full URL

    class Meta:
        model = Innovation
        fields = ['id', 'name', 'description', 'photo', 'sponsorship_needed','status','created_at']





class InnovationSerializerDetail(serializers.ModelSerializer):
    innovator_username = serializers.CharField(source='innovator.username', read_only=True)
    # If you use a custom user model with different field, adjust accordingly (e.g., email)

    class Meta:
        model = Innovation
        fields = [
            'id',
            'name',
            'description',
            'photo',
            'status',
            'sponsorship_needed',
            'created_at',
            'innovator',
            'innovator_username',
        ]
        read_only_fields = ['innovator', 'created_at']

