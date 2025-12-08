# uploads/models.py
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings 
from django.utils import timezone

class Upload(models.Model):
    DEGREE_CHOICES = [
        ('thesis', 'Thesis'),
        ('dissertation', 'Dissertation'),
    ]
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('draft', 'Draft'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ← NOT auth.User
        on_delete=models.CASCADE,
        related_name='uploads'
    )
    degree_type = models.CharField(
        max_length=20,
        choices=DEGREE_CHOICES,
        blank=True,           # ← allow blank temporarily
        null=True,            # ← allow null temporarily
        db_index=True         # ← fast filtering!
    )
    submission_type = models.CharField(max_length=100, )
    university = models.CharField(max_length=255, blank=True, null=True)
    cover_image = models.ImageField(upload_to='covers/')
    title = models.CharField(max_length=255)
    authors = models.CharField(max_length=255)
    year = models.PositiveIntegerField()
    description = models.TextField()
    file = models.FileField(upload_to='files/')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    supervisor_name = models.CharField(
    max_length=200,
    blank=True,
    null=True,
    verbose_name="Supervisor Name",
    help_text="e.g. Prof. Ahmed Mohamed"
)
    feedback = models.TextField(blank=True, null=True)
    # Add these fields
    likes_count = models.IntegerField(default=0)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.title} ({self.submission_type.replace('_', ' ').title()})"

    # Optional: Nice display name
    @property
    def category_display(self):
        """Returns: Thesis in Law, Dissertation in Medicine"""
        if not self.submission_type or '-' not in self.submission_type:
            return self.submission_type.replace('_', ' ').title() if self.submission_type else "Unknown"

        degree, field = self.submission_type.split('-', 1)
        degree = degree.replace('thesis', 'Thesis').replace('dissertation', 'Dissertation')
        field = field.replace('_', ' ').title()
        return f"{degree} in {field}"

    def save(self, *args, **kwargs):
        """Auto-fill degree_type from submission_type"""
        if self.submission_type and '-' in self.submission_type:
            degree_part = self.submission_type.split('-')[0].lower()
            if degree_part in ['thesis', 'dissertation']:
                self.degree_type = degree_part
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} — {self.category_display}"




class Rating(models.Model):
    document = models.ForeignKey(Upload, on_delete=models.CASCADE, related_name='ratings')
    user_identifier = models.CharField(max_length=255)  # Session key or IP
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])  # 1-5 stars
    created_at = models.DateTimeField(auto_now_add=True)  # Use default instead
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['document', 'user_identifier']
    
    def __str__(self):
        return f"{self.document.title} - {self.rating} stars"
    


class Like(models.Model):
    upload = models.ForeignKey(
        Upload, 
        on_delete=models.CASCADE, 
        related_name='likes'
    )
    ip_address = models.GenericIPAddressField()  # Store IP address
    user_agent = models.TextField(blank=True, null=True)  # Optional: browser info
    created_at = models.DateTimeField(auto_now_add=True)
    
    
    class Meta:
        unique_together = ['upload', 'ip_address']