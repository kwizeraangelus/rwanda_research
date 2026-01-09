# research/models.py (or profiles/models.py if you prefer)

from django.conf import settings
from django.db import models
from django.utils import timezone



class ResearchProfile(models.Model):
    """
    Dedicated academic/researcher profile – separate from general user profile.
    One per user, focused on research output.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='research_profile',               # different from 'researcher_profile'
        related_query_name='research_profile',
        null=True,
        blank=True
    )

    bio = models.TextField(
        blank=True,
        verbose_name="Bio / CV / Resume"
    )

    picture = models.ImageField(
        upload_to='research_pictures/',
        null=True,
        blank=True,
        verbose_name="Bio Picture (Optional)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Research Profile – {self.user.get_username() if self.user else 'No user'}"

    class Meta:
        verbose_name = "Research Profile"
        verbose_name_plural = "Research Profiles"
        ordering = ['-updated_at']


class AcademicPlatform(models.Model):
    research_profile = models.ForeignKey(
        ResearchProfile,
        on_delete=models.CASCADE,
        related_name='academic_platforms'
    )

    platform_id = models.CharField(
        max_length=200,
        verbose_name="Platform ID",
        help_text="e.g. ORCID: 0000-0002-1825-0097, Scopus ID: 12345678900"
    )

    def __str__(self):
        return self.platform_id

    class Meta:
        ordering = ['platform_id']


class Publication(models.Model):
    PUBLICATION_TYPES = [
        ('journal',     'Journal Article'),
        ('conference',  'Conference Paper'),
        ('symposium',   'Symposium Presentation'),
        ('book',        'Book / Monograph'),
        ('patent',      'Patent'),
    ]
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('approved',  'Approved'),
        ('rejected',  'Rejected'),
    ]
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True,           # faster filtering by status
    )
    status_changed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Status Last Changed"
    )

    research_profile = models.ForeignKey(
        ResearchProfile,
        on_delete=models.CASCADE,
        related_name='publications'
    )

    type = models.CharField(max_length=20, choices=PUBLICATION_TYPES, default='journal')
    title = models.CharField(max_length=500)
    authors = models.JSONField(default=list)  # ["Lastname1, Initials.", "Lastname2, Initials."]
    info = models.CharField(max_length=500, blank=True, help_text="Journal · Volume · Pages | Conference name & year | Publisher")
    doi_url = models.URLField(blank=True, null=True, verbose_name="DOI or URL")
    abstract = models.TextField(blank=True)
    pdf = models.FileField(upload_to='publications/pdfs/', null=True, blank=True)
    feedback = models.TextField(
        blank=True,
        verbose_name="Rejection Feedback / Moderator Notes",
        help_text="Visible to researcher when status = Rejected"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_type_display()}) - {self.get_status_display()}"

    def save(self, *args, **kwargs):
        # Auto-update status_changed_at when status changes
        if self.pk:  # existing object
            old = Publication.objects.get(pk=self.pk)
            if old.status != self.status:
                self.status_changed_at = timezone.now()
        else:
            # New publication → set initial timestamp
            self.status_changed_at = timezone.now()
            
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-status_changed_at', '-created_at']
        indexes = [
            models.Index(fields=['status', 'research_profile']),
        ]