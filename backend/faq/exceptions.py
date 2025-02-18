from rest_framework import status
from rest_framework.exceptions import APIException


class ScrapeException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "An unexpected error occured"
    default_code = "scraping_error"


class NoContentScrapeException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "No content found to summarize"
    default_code = "no_content"


class ConnectionScrapeException(APIException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = "Unable to connect to the provided URL"
    default_code = "connection_error"


class RequestScrapeException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Failed to fetch content from URL"
    default_code = "request_error"


class ParseException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Failed to process PDF"
    default_code = "pdf_error"


class PdfGenerationException(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "Failed to generate PDF"
    default_code = "pdf_error"
