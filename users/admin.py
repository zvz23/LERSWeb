from django.contrib import admin
from .models import CustomUser

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'full_name', 'phone_number', 'address']

admin.site.register(CustomUser, CustomUserAdmin)
