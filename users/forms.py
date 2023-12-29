from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.core.validators import RegexValidator
from .models import CustomUser
import re

PHONE_NUMBER_REGEX = re.compile(r'^(63\d{10}|09\d{9})$')

class SignupForm(UserCreationForm):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput)

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('username', 'email', 'phone_number', 'address', 'full_name')
        
    def clean_password2(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords do not match.")
        return password2
    
    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        match_result = PHONE_NUMBER_REGEX.match(phone_number)
        if match_result is None:
            raise forms.ValidationError("Phone number must be in the format '(63XXXXXXXXXX)' or '09XXXXXXXXX'.")
        try:
            CustomUser.objects.get(phone_number=phone_number)
            raise forms.ValidationError("Phone number is already used.")
        except:
            pass
        if phone_number.startswith("63"):
            return phone_number[2:]
        return phone_number
