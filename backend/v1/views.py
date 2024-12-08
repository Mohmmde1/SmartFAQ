from django.http import JsonResponse

def example_view(request):
    return JsonResponse({"message": "API v1 is working!"})
