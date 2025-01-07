# faq/views.py
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .faq_generator import generate_faq
from .models import FAQ
from .serializers import FAQSerializer


class FAQViewSet(ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer

    def perform_create(self, serializer):
        """
        Overwrite the default create method to include FAQ generation.
        """
        text = serializer.validated_data['content']
        generated_faqs = generate_faq(text)  # Generate FAQs from the provided text
        serializer.save(user=self.request.user, generated_faqs=generated_faqs)

    def get_queryset(self):
        """
        Ensure users can only see their own FAQs.
        """
        return FAQ.objects.filter(user=self.request.user)
