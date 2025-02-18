from rest_framework import status
from rest_framework.exceptions import APIException


class ScrapeException(APIException):
    """Base exception for scraping errors."""
    def __init__(self, detail=None, field=None, code=None):
        if field:
            detail = {field: [detail]}
        super().__init__(detail, code)
        

class NoContentScrapeException(ScrapeException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "No content found to summarize"
    default_code = "no_content"

class ConnectionScrapeException(ScrapeException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = "Unable to connect to the provided URL"
    default_code = "connection_error"

class RequestScrapeException(ScrapeException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Failed to fetch content from URL"
    default_code = "request_error"