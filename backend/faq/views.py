# faq/views.py

from datetime import datetime, timedelta

from django.db.models import Count
from django.db.models.functions import TruncDate, TruncMonth
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from rest_framework.viewsets import ModelViewSet

from .models import FAQ
from .serializers import FAQSerializer, FAQStatisticsSerializer
from .services import generate_faq


class FAQViewSet(ModelViewSet):
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticated]

    def _generate_title(self, content: str, max_length: int = 50) -> str:
        """Generate a title from content with ellipsis if too long."""
        return f"{content[:max_length]}..." if len(content) > max_length else content

    def _process_faq_data(self, serializer: ModelSerializer) -> dict:
        """Process FAQ data and generate FAQs."""
        text = serializer.validated_data['content']
        number_of_faqs = serializer.validated_data.get('number_of_faqs', 3)
        tone = serializer.validated_data.get('tone', 'netural')

        return {
            'user': self.request.user,
            'title': self._generate_title(text),
            'generated_faqs': generate_faq(text, number_of_faqs, tone)
        }

    def perform_create(self, serializer: ModelSerializer) -> None:
        """Create FAQ with generated content."""
        serializer.save(**self._process_faq_data(serializer))

    def perform_update(self, serializer: ModelSerializer) -> None:
        """Update FAQ with newly generated content."""
        serializer.save(**self._process_faq_data(serializer))

    def get_queryset(self):
        """Filter FAQs by current user."""
        return FAQ.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get FAQ statistics."""
        queryset = self.get_queryset()

        # Basic stats
        total_faqs = queryset.count()
        total_questions = sum(faq.generated_faqs.count() for faq in queryset)
        avg_questions = total_questions / total_faqs if total_faqs > 0 else 0
        last_faq = queryset.first()

        # Monthly trends
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_trends = list(
            queryset
            .filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # Daily trends for last 7 days
        seven_days_ago = datetime.now() - timedelta(days=7)
        daily_trends = list(
            queryset
            .filter(created_at__gte=seven_days_ago)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )

        # Fill in missing days with zero counts
        existing_days = {trend['day']: trend['count'] for trend in daily_trends}
        all_days = []
        for i in range(7):
            day = (datetime.now() - timedelta(days=i)).date()
            all_days.append({
                'day': day.strftime('%a'),  # Mon, Tue, etc.
                'count': existing_days.get(day, 0)
            })
        all_days.reverse()

        # Categories
        tones = list(
            queryset
            .values('tone')
            .annotate(value=Count('id'))
            .order_by('-value')
        )

        statistics_data = {
            'total_faqs': total_faqs,
            'total_questions': total_questions,
            'avg_questions_per_faq': round(avg_questions, 1),
            'last_faq_created': last_faq,
            'monthly_trends': [
                {
                    'month': item['month'].strftime('%b'),
                    'count': item['count']
                } for item in monthly_trends
            ],
            'daily_trends': all_days,
            'tones': [
                {
                    'tone': item['tone'] or 'Uncategorized',
                    'value': item['value']
                } for item in tones
            ]
        }
        serializer = FAQStatisticsSerializer(statistics_data)
        return Response(serializer.data)
