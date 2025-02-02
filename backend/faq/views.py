# faq/views.py
import logging

import requests
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import FAQ
from .serializers import FAQSerializer, FAQStatisticsSerializer
from .services import generate_faq, get_faq_statistics, scrape_and_summarize

logger = logging.getLogger(__name__)

class FAQViewSet(ModelViewSet):
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FAQ.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        text = serializer.validated_data['content']
        number_of_faqs = serializer.validated_data.get('number_of_faqs', 3)
        tone = serializer.validated_data.get('tone', 'neutral')

        serializer.save(
            user=self.request.user,
            title=text[:50] + ('...' if len(text) > 50 else ''),
            generated_faqs=generate_faq(text, number_of_faqs, tone)
        )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        statistics_data = get_faq_statistics(self.get_queryset())
        return Response(FAQStatisticsSerializer(statistics_data).data)

    @action(detail=False, methods=['post'])
    def scrape(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        url = request.data.get('url')
        if not url:
            return Response(
                {'error': 'URL is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            content = scrape_and_summarize(url, request.user.email)
            return Response({'content': content})
        except requests.RequestException as e:
            logger.error(f"Network error while scraping {url}: {str(e)}")
            return Response(
                {'error': 'Failed to fetch URL content'},
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as e:
            logger.error(f"Error processing URL {url}: {str(e)}")
            return Response(
                {'error': 'Failed to process content'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
