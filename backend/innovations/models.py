# uploads/models.py
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings 

class Upload(models.Model):
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
    submission_type = models.CharField(max_length=50)
    university = models.CharField(max_length=255, blank=True, null=True)
    cover_image = models.ImageField(upload_to='covers/')
    title = models.CharField(max_length=255)
    authors = models.CharField(max_length=255)
    year = models.PositiveIntegerField()
    description = models.TextField()
    file = models.FileField(upload_to='files/')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    feedback = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title