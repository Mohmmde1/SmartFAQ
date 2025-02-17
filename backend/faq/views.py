# faq/views.py
import logging

from django.http import FileResponse
from requests.exceptions import ConnectionError, RequestException
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from urllib3.exceptions import MaxRetryError

from .models import FAQ
from .serializers import FAQSerializer, FAQStatisticsSerializer, ScrapeSerializer
from .services import (
    extract_text,
    generate_faq,
    generate_faq_pdf,
    get_faq_statistics,
    scrape_and_summarize,
    validate_pdf,
)

logger = logging.getLogger(__name__)


class FAQViewSet(ModelViewSet):
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FAQ.objects.filter(user=self.request.user).order_by("-created_at").prefetch_related("generated_faqs")

    def perform_create(self, serializer):
        text = serializer.validated_data["content"]
        number_of_faqs = serializer.validated_data.get("number_of_faqs")
        tone = serializer.validated_data.get("tone")

        serializer.save(
            user=self.request.user,
            title=text[:50] + ("..." if len(text) > 50 else ""),
            generated_faqs=generate_faq(text, number_of_faqs, tone),
        )

    @action(detail=False, methods=["get"])
    def statistics(self, _request):
        statistics_data = get_faq_statistics(self.get_queryset())
        return Response(FAQStatisticsSerializer(statistics_data).data)

    @action(detail=False, methods=["post"])
    def scrape(self, request):
        serializer = ScrapeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            content = scrape_and_summarize(
                serializer.validated_data["url"],
                request.user.email
            )
            if content == "No content found to summarize":
                logger.warning(
                    "No content found to summarize for URL: %s", 
                    serializer.validated_data["url"]
                )
                return Response(
                    {"non_field_errors": ["No content found to summarize"]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response({"content": content})

        except (ConnectionError, MaxRetryError) as err:
            logger.error(
                "Connection error for URL %s: %s", 
                serializer.validated_data["url"], 
                str(err)
            )
            return Response(
                {"url": ["Unable to connect to the provided URL. Please check if the URL is accessible."]},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except RequestException as err:
            logger.error(
                "Request failed for URL %s: %s", 
                serializer.validated_data["url"], 
                str(err)
            )
            return Response(
                {"url": ["Failed to fetch content from URL. Please try again later."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception:
            logger.exception(
                "Unexpected error processing URL %s", 
                serializer.validated_data["url"]
            )
            return Response(
                {"non_field_errors": ["An unexpected error occurred while processing the URL."]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(url_path="upload-pdf", detail=False, methods=["post"], parser_classes=[MultiPartParser])
    def upload_pdf(self, request):
        if "file" not in request.FILES:
            return Response({"error": "No PDF file provided"}, status=status.HTTP_400_BAD_REQUEST)

        pdf_file = request.FILES["file"]

        # Validate PDF
        is_valid, error_message = validate_pdf(pdf_file)
        if not is_valid:
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

        try:
            text = extract_text(pdf_file)
            return Response({"content": text})

        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            return Response({"error": "Failed to process PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        faq = self.get_object()
        try:
            pdf_buffer = generate_faq_pdf(faq)
            return FileResponse(pdf_buffer, as_attachment=True, filename=f"faq_{faq.id}.pdf")
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            return Response({"error": "Failed to generate PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
