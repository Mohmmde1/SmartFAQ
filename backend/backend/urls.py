from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),  # Django admin
    path("api/v1/", include("v1.urls")),  # API Version 1 routes
]
