from django.db import models

# Create your models here.
class CallLog(models.Model):
    number = models.CharField(max_length=30, blank=False, null=False)
    duration = models.FloatField(blank=True, null=True)
    date_long = models.BigIntegerField(unique=True, blank=False, null=False)
    coordinates = models.CharField(max_length=150, blank=False, null=False)
    date = models.DateTimeField(blank=False, null=False)
    status = models.CharField(max_length=15, blank=False, null=False)
    response_status = models.CharField(max_length=20, blank=True, null=True)
    def __eq__(self, __other: object):
        if isinstance(__other, CallLog):
            if self.number == __other.number and self.duration == __other.duration and self.date_long == __other.date_long and self.status == __other.status:
                return True
        return False
    
    def __str__(self):
        return self.number
