from django.urls import path
from . import views  # Ensure this import is correct and does not cause circular imports

urlpatterns = [
    path('example/', views.example_view, name='example'),  # Example route
]
