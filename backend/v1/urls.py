from django.urls import include, path

from . import views  # Ensure this import is correct and does not cause circular imports

urlpatterns = [
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/google/', views.GoogleLogin.as_view(), name='google_login'),
    path('faq/', include('faq.urls')),
]
