# faq/views.py
import logging

from django.http import FileResponse
from requests.exceptions import ConnectionError, RequestException
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from urllib3.exceptions import MaxRetryError

from .exceptions import NoContentError, RequestError, ServiceUnavailableError
from .models import FAQ
from .serializers import FAQSerializer, FAQStatisticsSerializer, PdfSerializer, ScrapeSerializer
from .services import (
    extract_text,
    generate_faq,
    generate_faq_pdf,
    get_faq_statistics,
    scrape_and_summarize,
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
        """
        Scrape and summarize content from a URL.
        """
        serializer = ScrapeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            content = scrape_and_summarize(
                serializer.validated_data["url"],
                request.user.email
            )
            
        except ConnectionError as err:
            logger.error("Connection failed for URL: %s", serializer.validated_data["url"])
            raise ConnectionError() from err
        except RequestException as err:
            logger.error("Request failed for URL: %s", serializer.validated_data["url"])
            raise RequestError() from err
        except Exception as err:
            logger.exception("Unexpected error scraping URL: %s", serializer.validated_data["url"])
            raise ServiceUnavailableError() from err
        
        if not content:
                logger.warning(
                    "No content found to summarize for URL: %s", 
                    serializer.validated_data["url"]
                )
                raise NoContentError()
                
        return Response({"content": content})

    @action(url_path="upload-pdf", detail=False, methods=["post"], parser_classes=[MultiPartParser])
    def upload_pdf(self, request):
        serializer = PdfSerializer(data=request.FILES)
        try:
            serializer.is_valid(raise_exception=True)
            text = extract_text(serializer.validated_data["file"])
            return Response({"content": text})
        except Exception as e:
            logger.error("Error processing PDF: %s", str(e))
            return Response(
                {"non_field_errors": ["Failed to process PDF"]},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        faq = self.get_object()
        try:
            pdf_buffer = generate_faq_pdf(faq)
            return FileResponse(pdf_buffer, as_attachment=True, filename=f"faq_{faq.id}.pdf")
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            return Response({"error": "Failed to generate PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
