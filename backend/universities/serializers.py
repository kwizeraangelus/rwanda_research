from rest_framework import serializers
from .models import ResearchProfile, AcademicPlatform, Publication

class PlatformSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicPlatform
        fields = ['id', 'platform_id']

# research/serializers.py

class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = [
            'id',
            'type',
            'title',
            'authors',
            'info',
            'doi_url',
            'abstract',
            'pdf',
            'status',               # new
            'feedback',             # new
            'status_changed_at',    # new – optional but useful
            'created_at',
        ]
        read_only_fields = ['status', 'feedback', 'status_changed_at', 'created_at']
        # Note: status & feedback are read-only for regular users

class ResearcherSerializer(serializers.ModelSerializer):
    academic_platforms = PlatformSerializer(many=True, read_only=True)  # Changed from 'platforms'
    publications = PublicationSerializer(many=True, read_only=True)

    class Meta:
        model = ResearchProfile
        fields = ['id', 'bio', 'picture', 'academic_platforms', 'publications']