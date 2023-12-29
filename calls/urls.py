from django.urls import path
from . import views
from django.contrib import admin

app_name = 'calls'

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", views.index, name="index"),
    path("save/", views.save, name="save"),
    path("live/", views.live, name="live"),
    path("changestatus/", views.changestatus, name="changestatus")
]