"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information, please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # Django admin
    path('api/v1/', include('v1.urls')),  # API Version 1 routes
    # Add additional versions below as needed:
    # path('api/v2/', include('v2.urls')),
]
