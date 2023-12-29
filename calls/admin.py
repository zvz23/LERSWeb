from django.contrib import admin
from .models import CallLog
# Register your models here.

class CallLogAdmin(admin.ModelAdmin):
    list_display = ['number', 'date', 'coordinates', 'status', 'response_status']

admin.site.site_header = "LERS Admin Panel"
admin.site.register(CallLog, CallLogAdmin)