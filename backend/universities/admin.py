from django.contrib import admin

# Register your models here.
from .models import Publication, ResearchProfile, AcademicPlatform


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ('title', 'research_profile', 'type', 'status', 'status_changed_at')
    list_filter = ('status', 'type', 'created_at')
    search_fields = ('title', 'authors__contains', 'info')
    readonly_fields = ('created_at', 'updated_at', 'status_changed_at')
    fieldsets = (
        (None, {
            'fields': ('research_profile', 'type', 'title', 'authors', 'info', 'doi_url', 'abstract', 'pdf')
        }),
        ('Moderation', {
            'fields': ('status', 'feedback', 'status_changed_at'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
