# uploads/serializers.py
from rest_framework import serializers
from .models import Upload



class UploadSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    

    class Meta:
        model = Upload
        fields = [
            'id',
            'submission_type',
            'university',
            'title',
            'authors',
            'year',
            'description',
            'supervisor_name',
            'file',
            'file_url',
            'status',
            'degree_type',
            
            'feedback',
            'uploaded_at']
        read_only_fields = ['user', 'status', 'uploaded_at']

    def validate_submission_type(self, value):
        if not value:
            raise serializers.ValidationError("This field is required.")

        value = value.strip().lower()
        if '-' not in value:
            raise serializers.ValidationError(
                "Invalid format. Use: thesis-law or dissertation-medicine"
            )

        degree, field = value.split('-', 1)
        if degree not in ['thesis', 'dissertation']:
            raise serializers.ValidationError(
                "First part must be 'thesis' or 'dissertation'"
            )
        if not field.strip():
            raise serializers.ValidationError("Field of study cannot be empty")

        # Clean and return
        return f"{degree}-{field.strip().replace(' ', '_')}"

    def validate(self, data):
        # Extra safety
        if 'submission_type' in data:
            data['submission_type'] = self.validate_submission_type(data['submission_type'])
        return data

    def get_file_url(self, obj): return obj.file.url







class BookDetailSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Upload
        fields = [
            'id', 'title', 'authors', 'year', 'description',
            'cover_image', 'file_url',
            'submission_type', 'university'
        ]

    def get_cover_image(self, obj):
        if obj.cover_image:
            return self.context['request'].build_absolute_uri(obj.cover_image.url)
        return None

    def get_file_url(self, obj):
        if obj.file:
            return self.context['request'].build_absolute_uri(obj.file.url)
        return None






class BookSerializer(serializers.ModelSerializer):
    authors = serializers.CharField(source='user.get_username', read_only=True)
    # OR if no user:
    # authors = serializers.SerializerMethodField()

    class Meta:
        model = Upload
        fields = ['id','title', 'authors', 'description', 'cover_image', 'file_url', 'year', 'submission_type', 'status', 'university']

    # def get_authors(self, obj):
    #     return obj.user.get_full_name() if obj.user else "Anonymous"



class PublicUploadSerializer(serializers.ModelSerializer):
 file_url = serializers.FileField(source='file', read_only=True)
 cover_image = serializers.ImageField(read_only=True)

 class Meta:
        model = Upload
        fields = [
            'id',
            'title',
            'authors',        # now correct
            'description',
            'cover_image',   # full URL
            'file_url', 
            'status',     # full URL
            # add any other field you want (year, university, etc.)
        ]













class UploadSerializers(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()
    user_id = serializers.CharField(source='user.pk', read_only=True)
    
    # Human-readable status
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Optional: include category_display if you want to use it on frontend
    category_display = serializers.CharField(read_only=True)

    class Meta:
        model = Upload
        fields = [
        'user_id',
            'id',
            'title',
            'authors',
            'year',
            'description',
            'cover_image',
            'file_url',
            'status',
            'status_display',
            'supervisor_name',
            'submission_type',
            'university',
            'uploaded_at',
            'user',              
            'category_display',
        ]
        read_only_fields = ['uploaded_at', 'user', 'status_display', 'category_display']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_cover_image(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url
        return None
    








# serializers.py  ← MUST HAVE THIS

class BookDetailSerializers(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    user_id = serializers.CharField(source='user.pk', read_only=True)  # ← THIS IS THE KEY!

    class Meta:
        model = Upload
        fields = [
            'id',
            'title',
            'authors',
            'year',
            'description',
            'cover_image',
            'file_url',
            'submission_type',
            'university',
            'supervisor_name',
            'user_id',        # ← MUST BE IN FIELDS!
        ]

    def get_cover_image(self, obj):
        if obj.cover_image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.cover_image.url)
        return None

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.file.url)
        return None












