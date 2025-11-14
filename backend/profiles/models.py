# profile/models.py
from django.db import models
from django.conf import settings  # ← SAFE
import uuid

class ResearcherProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  # ← NOT auth.User
        on_delete=models.CASCADE,
        related_name='researcher_profile'
    )

    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    national_id = models.CharField(max_length=50, blank=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    degree = models.CharField(max_length=100, blank=True)

    university = models.CharField(max_length=255, blank=True)

    profile_complete = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        required = [
            self.user.username, self.user.email, self.phone, self.degree,
            self.age, self.national_id,
        ]
        if self.university:
            required.append(self.university)
        self.profile_complete = all(required)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username}'s Profile"