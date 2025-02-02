# faq/views.py
import logging

import PyPDF2
import requests
from django.http import FileResponse
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import FAQ
from .serializers import FAQSerializer, FAQStatisticsSerializer
from .services import (
    generate_faq,
    generate_faq_pdf,
    get_faq_statistics,
    scrape_and_summarize,
    validate_pdf,
    validate_url,
)

logger = logging.getLogger(__name__)


class FAQViewSet(ModelViewSet):
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FAQ.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        text = serializer.validated_data["content"]
        number_of_faqs = serializer.validated_data.get("number_of_faqs", 3)
        tone = serializer.validated_data.get("tone", "neutral")

        serializer.save(
            user=self.request.user,
            title=text[:50] + ("..." if len(text) > 50 else ""),
            generated_faqs=generate_faq(text, number_of_faqs, tone),
        )

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        statistics_data = get_faq_statistics(self.get_queryset())
        return Response(FAQStatisticsSerializer(statistics_data).data)

    @action(detail=False, methods=["post"])
    def scrape(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        url = request.data.get("url")
        if not url:
            return Response({"error": "URL is required"}, status=status.HTTP_400_BAD_REQUEST)

        is_valid, error_message = validate_url(url)
        if not is_valid:
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

        try:
            content = scrape_and_summarize(url, request.user.email)
            return Response({"content": content})
        except requests.RequestException as e:
            logger.error(f"Network error while scraping {url}: {str(e)}")
            return Response({"error": "Failed to fetch URL content"}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            logger.error(f"Error processing URL {url}: {str(e)}")
            return Response({"error": "Failed to process content"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(url_path="upload-pdf", detail=False, methods=["post"], parser_classes=[MultiPartParser])
    def upload_pdf(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        if "file" not in request.FILES:
            return Response({"error": "No PDF file provided"}, status=status.HTTP_400_BAD_REQUEST)

        pdf_file = request.FILES["file"]

        # Validate PDF
        is_valid, error_message = validate_pdf(pdf_file)
        if not is_valid:
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # File pointer is already at start due to validation
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()

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
