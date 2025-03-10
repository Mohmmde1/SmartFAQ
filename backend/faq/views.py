# faq/views.py
import logging

from django.http import FileResponse
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import FAQ
from .selectors.statistics_selector import StatisticsSelector
from .serializers import FAQSerializer, FAQStatisticsSerializer, PdfSerializer, ScrapeSerializer
from .services import (
    extract_text,
    generate_faq,
    generate_faq_pdf,
    scrape_and_summarize,
)

logger = logging.getLogger(__name__)


class FAQViewSet(ModelViewSet):
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FAQ.objects.get_user_faqs(self.request.user)

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
        """Get FAQ statistics."""
        stats = StatisticsSelector.get_statistics(self.get_queryset())
        return Response(FAQStatisticsSerializer(stats).data)

    @action(detail=False, methods=["post"])
    def scrape(self, request):
        """Scrape and summarize content from a URL."""
        serializer = ScrapeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        content = scrape_and_summarize(
            serializer.validated_data["url"],
        )

        return Response({"content": content})

    @action(url_path="upload-pdf", detail=False, methods=["post"], parser_classes=[MultiPartParser])
    def upload_pdf(self, request):
        serializer = PdfSerializer(data=request.FILES)
        serializer.is_valid(raise_exception=True)

        text = extract_text(serializer.validated_data["file"])

        return Response({"content": text})

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        faq = self.get_object()
        pdf_buffer = generate_faq_pdf(faq)

        return FileResponse(pdf_buffer, as_attachment=True, filename=f"faq_{faq.id}.pdf")
