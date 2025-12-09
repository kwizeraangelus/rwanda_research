from django.db import models
from django.utils import timezone

# Create your models here.
class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    icon = models.CharField(max_length=50, default='Calendar')
    link = models.URLField(
        blank=True, 
        null=True, 
        help_text="Direct link to event page (e.g. Eventbrite, Zoom, Google Form)"
    
    )
    photo = models.ImageField(
        upload_to='event_photos/',
        blank=True,
        null=True,
        help_text="Event banner or promotional photo"
    )
    icon = models.CharField(max_length=50, default='Calendar')
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-date']