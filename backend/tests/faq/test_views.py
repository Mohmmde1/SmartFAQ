import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import force_authenticate

from auths.models import User
from faq.models import FAQ
from faq.views import FAQViewSet


@pytest.mark.django_db
class TestFAQViewSet:
    def test_get_queryset_authenticated_user(self, user, basic_faq, api_factory):
        """Test that get_queryset returns only FAQs for authenticated user."""
        # Create another user and their FAQs
        other_user = User.objects.create_user(email="other@test.com", password="testpass123")
        other_faq = FAQ.objects.create(user=other_user, title="Other FAQ", content="Other content")

        # Create API factory and view
        view = FAQViewSet.as_view({"get": "list"})

        # Make request and force authentication
        request = api_factory.get(reverse("faq-list"))
        force_authenticate(request, user=user)
        response = view(request)
        data = response.data

        # Assert response
        assert response.status_code == status.HTTP_200_OK
        assert data["count"] == 1
        assert data["results"][0]["id"] == basic_faq.id
        assert other_faq.id not in [faq["id"] for faq in data["results"]]

    def test_get_queryset_unauthenticated(self, api_factory):
        """Test that unauthenticated users cannot access FAQs."""
        view = FAQViewSet.as_view({"get": "list"})
        request = api_factory.get(reverse("faq-list"))

        response = view(request)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_faq_success(self, basic_faq, user, api_factory):
        """Test updating faq."""
        view = FAQViewSet.as_view({"patch": "partial_update"})
        url = reverse("faq-detail", args=[basic_faq.id])

        request = api_factory.patch(url, {"content": "Updated", "tone": "formal"})
        force_authenticate(request, user=user)
        response = view(request, pk=basic_faq.id)

        assert response.data["content"] == "Updated"
        assert response.data["tone"] != basic_faq.tone
        assert response.status_code == status.HTTP_200_OK

    def test_create_faq_success(self, user, api_factory):
        """Test creating faq."""
        payload = {"content": "content", "tone": "formal", "number_of_faqs": 1}
        view = FAQViewSet.as_view({"post": "create"})
        request = api_factory.post(reverse("faq-list"), payload, format="json")
        force_authenticate(request, user=user)
        response = view(request)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["user"] == user.id
        assert response.data["content"] == payload["content"]
        assert response.data["tone"] == payload["tone"]
        assert response.data["number_of_faqs"] == payload["number_of_faqs"]
        assert len(response.data["generated_faqs"]) == payload["number_of_faqs"]
