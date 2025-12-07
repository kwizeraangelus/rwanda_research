from rest_framework import serializers
from .models import CustomUser, USER_CATEGORIES  # ← Import both


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'phone_number', 'user_category', 'university_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

    def validate_user_category(self, value):
        valid_categories = dict(USER_CATEGORIES).keys()
        if value not in valid_categories:
            raise serializers.ValidationError("Invalid category selected.")
        return value

    def validate(self, data):
        category = data.get('user_category')
        university_name = data.get('university_name')

        if category != 'university' and university_name:
            raise serializers.ValidationError("University name is only allowed for 'university' category.")
        if category == 'university' and not university_name:
            raise serializers.ValidationError("University name is required for 'university' category.")
        return data
    









class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
        )
        return user
    


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UserProfileSerializer(serializers.ModelSerializer):


    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'user_category']