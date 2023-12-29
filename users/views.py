from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login
from .forms import SignupForm
from django.shortcuts import HttpResponse
from django.contrib.auth.decorators import login_required, user_passes_test


def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            form.save()
            # Redirect to a success page or login page after successful signup
            return redirect('users:success')  # Replace 'login' with your actual login URL name
    else:
        form = SignupForm()

    return render(request, 'users/signup.html', {'form': form})



def signin(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, request.POST)
        if form.is_valid():
            user = form.get_user()
            if user is not None:
                login(request, user)
                return redirect('users:profile')
    else:
        form = AuthenticationForm()

    return render(request, 'users/signin.html', {'form': form})


def not_staff_check(user):
    return not user.is_staff

@login_required
@user_passes_test(not_staff_check)
def profile(request):
    # Your view logic here
    return HttpResponse("Welcome, non-staff user!")


def success(request):
    return render(request, 'users/success.html')