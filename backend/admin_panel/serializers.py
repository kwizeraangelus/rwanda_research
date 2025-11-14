from rest_framework import serializers
from innovations.models import Upload

from events.models import Event
from django.contrib.auth import get_user_model

User = get_user_model()

# api/serializers.py
from django.conf import settings

class AdminUploadSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Upload
        fields = [
            'id', 'title', 'author_name', 'submission_type',
            'status', 'status_display', 'feedback', 'file_url', 'cover_image_url'
        ]

    def get_file_url(self, obj):
        if obj.file:
            return f"{settings.MEDIA_URL}{obj.file.name}".replace('\\', '/')
        return None

    def get_cover_image_url(self, obj):
        if obj.cover_image:
            return f"{settings.MEDIA_URL}{obj.cover_image.name}".replace('\\', '/')
        return None



class UserSerializer(serializers.ModelSerializer):
      class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'location','link']




User = get_user_model()

class AdminUserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone_number',
            'user_category', 'university_name',
            'password', 'confirm_password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user