# profile/serializers.py
from rest_framework import serializers
from .models import ResearcherProfile
from django.contrib.auth.models import User
from users.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'user_category', 'is_staff']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = ResearcherProfile
        fields = [
            'id', 'user','sdetails',  'age', 'phone', 
            'location', 'university', 'profile_image', 
            'profile_complete'
        ]
        read_only_fields = ['profile_complete']




# serializers.py
class ResearcherProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    profile_image = serializers.ImageField(read_only=True)

    class Meta:
        model = ResearcherProfile
        fields = ['id', 'username', 'profile_image', 'details', 'university']