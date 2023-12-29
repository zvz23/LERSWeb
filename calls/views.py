from django.shortcuts import render, HttpResponse, redirect, HttpResponseRedirect
from django.contrib.admin.views.decorators import staff_member_required
from django.http.response import JsonResponse
from django.urls import reverse
from django.http.request import HttpRequest
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from .models import CallLog
from users.models import CustomUser
from django.forms.models import model_to_dict
import json
import datetime
from django.utils import timezone
from datetime import timedelta

def dict_to_call_log(call_log_json: dict):
    date_ms = call_log_json['Date'] / 1000
    date = datetime.datetime.utcfromtimestamp(date_ms)
    call_log = CallLog()
    call_log.number = call_log_json['Number'].removeprefix('+').strip()
    call_log.duration = call_log_json['Duration']
    call_log.date_long = call_log_json['Date']
    call_log.date = date
    call_log.coordinates = call_log_json['Coordinates']
    call_log.status = call_log_json['Status']
    return call_log

@csrf_exempt
def save(request: HttpRequest):
    if request.method == 'POST':
        call_log = json.loads(request.body)
        temp_call_log = dict_to_call_log(call_log)
        try:
            call_log = CallLog.objects.get(date_long=temp_call_log.date_long)
            if call_log != temp_call_log:
                call_log.duration = temp_call_log.duration
                call_log.status = temp_call_log.status
                call_log.save()
        except CallLog.DoesNotExist:
            temp_call_log.save()
        return HttpResponseRedirect(reverse('index'))
    

def live(request):
    not_responded_calls = CallLog.objects.filter(
        response_status__isnull=True
    )
    not_responded_calls = [model_to_dict(i, fields=[field.name for field in i._meta.fields]) for i in not_responded_calls]
    for call in not_responded_calls:
        try:
            user = CustomUser.objects.get(phone_number=call['number'])
            user = model_to_dict(user, fields=[field.name for field in user._meta.fields])
            call['user'] = user
        except:
            call['user'] = None
    return JsonResponse({'recent_not_responded_logs': not_responded_calls})

@staff_member_required
@csrf_exempt
def changestatus(request):
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            call_log = CallLog.objects.get(pk=data['callId'])
            call_log.response_status = data["status"]
            call_log.save()
            return JsonResponse({"status": 200})

        except:
            return JsonResponse({"status": 400, "message": "No call log with the given id."}, status=400)        

@staff_member_required
def index(request: HttpRequest):
    if request.method == "GET":
        call_logs = [model_to_dict(i, fields=[field.name for field in i._meta.fields]) for i in CallLog.objects.all()]
        context = {
            'call_logs': call_logs
        }
        return render(request, 'calls/index.html', context=context)