# faq/views.py

from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ModelSerializer
from rest_framework.viewsets import ModelViewSet

from .models import FAQ
from .serializers import FAQSerializer
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
        return FAQ.objects.filter(user=self.request.user).order_by('created_at')
