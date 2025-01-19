# faq/views.py
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import FAQ
from .serializers import FAQSerializer
from .services import generate_faq


class FAQViewSet(ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticated]

    def _generate_title(self, content: str) -> str:
        return content[:50] + '...' if len(content) > 50 else content

    def perform_create(self, serializer):
        """
        Overwrite the default create method to include FAQ generation.
        """
        text = serializer.validated_data['content']
        number_of_faqs = serializer.validated_data.get('number_of_faqs', 3)
        title = self._generate_title(text)
        generated_faqs = generate_faq(text, number_of_faqs)
        serializer.save(
            user=self.request.user,
            title=title,
            generated_faqs=generated_faqs
        )

    def get_queryset(self):
        """
        Ensure users can only see their own FAQs.
        """
        return FAQ.objects.filter(user=self.request.user)
