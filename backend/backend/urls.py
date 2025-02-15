from django.contrib import admin
from django.urls import include, path

from debug_toolbar.toolbar import debug_toolbar_urls

urlpatterns = [
    path("admin/", admin.site.urls),  # Django admin
    path("api/v1/", include("v1.urls")),  # API Version 1 routes
] + debug_toolbar_urls()
