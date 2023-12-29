from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=False, null=False, unique=True)
    address = models.CharField(max_length=150, blank=False, null=False)
    full_name = models.CharField(max_length=255, blank=False, null=False)

