import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


# GLOBAL CHOICES — OUTSIDE THE CLASS
USER_CATEGORIES = (
    ('researcher', _('Researcher')),
    ('university', _('University')),
    ('conf_organizer', _('Conference Organizer')),
    ('public_visitor', _('Public Visitor')),
    ('admin', _('admin')),
)


class CustomUser(AbstractUser):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    # EMAIL MUST BE UNIQUE
    email = models.EmailField(
        _('email address'),
        unique=True,  # ← REQUIRED!
        error_messages={
            'unique': _("A user with that email already exists."),
        },
    )

    phone_number = models.CharField(max_length=20, blank=True, null=True)
    user_category = models.CharField(
        max_length=20,
        choices=USER_CATEGORIES,  # ← FIXED: was USER_CATEGORY_CHOICES
        default='public_visitor',
    )
    university_name = models.CharField(max_length=255, blank=True, null=True)

    USERNAME_FIELD = 'email'        # Login with email
    REQUIRED_FIELDS = ['username']  # Needed for createsuperuser

    def __str__(self):
        return self.email