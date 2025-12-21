from django.db import models
from django.conf import settings 

# Create your models here.
# views.py
# models.py (relevant fields)
class Innovation(models.Model):
    
    innovator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200)
    description = models.TextField()
    photo = models.ImageField(upload_to='innovations/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=[('pending','Pending'),('approved','Approved'),('rejected','Rejected')], default='pending')
    sponsorship_needed = models.CharField(max_length=20, choices=[('sponsored','Sponsored'),('unsponsored','Unsponsored'),('no-need','No Need')], default='no-need')
    created_at = models.DateTimeField(auto_now_add=True)


