from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError


class NoContentError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "No content found to summarize"
    default_code = "no_content"


class ServiceUnavailableError(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Unable to connect to the URL. Please check if it's accessible."
    default_code = "service_unavailable"

class RequestError(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "Failed to fetch content from URL."
    default_code = "internal_server_error"