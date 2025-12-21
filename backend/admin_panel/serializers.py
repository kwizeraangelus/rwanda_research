from rest_framework import serializers
from innovations.models import Upload
from search.models import Innovation
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
        fields = ['id', 'username', 'email', 'date_joined','phone_number']

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
    







class InnovationSerializer(serializers.ModelSerializer):
    innovator_username = serializers.CharField(source='innovator.username', read_only=True)
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Innovation
        fields = [
            'id', 'name', 'description', 'photo', 'status',
            'sponsorship_needed', 'created_at', 'innovator', 'innovator_username','feedback'
        ]
        read_only_fields = ['innovator', 'created_at', 'status']












User = get_user_model()

class InnovationAdminSerializer(serializers.ModelSerializer):
    innovator_name = serializers.CharField(source='innovator.username', read_only=True)
    photo_url = serializers.SerializerMethodField()
    sponsorship_display = serializers.CharField(source='get_sponsorship_needed_display', read_only=True)

    class Meta:
        model = Innovation
        fields = [
            'id',
            'name',
            'description',
            'photo_url',
            'status',
            'sponsorship_needed',
            'sponsorship_display',
            'innovator',
            'innovator_name',
            'feedback'
            'created_at'
        ]
        read_only_fields = ['innovator', 'status', 'created_at']

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return f"/media/{obj.photo}"
        return None