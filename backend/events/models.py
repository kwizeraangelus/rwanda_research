from django.db import models

# Create your models here.
class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    link = models.URLField(
        blank=True, 
        null=True, 
        help_text="Direct link to event page (e.g. Eventbrite, Zoom, Google Form)"
    )