import pytest
from django.urls import reverse
from rest_framework import status

from auths.models import User
from faq.models import FAQ


@pytest.mark.django_db
class TestFAQViewSet:
    def test_get_queryset_authenticated_user(self, user, basic_faq, authenticated_client):
        """Test that get_queryset returns only FAQs for authenticated user."""
        # Create another user and their FAQs
        other_user = User.objects.create_user(email="other@test.com", password="testpass123")
        other_faq = FAQ.objects.create(user=other_user, title="Other FAQ", content="Other content")

        response = authenticated_client.get(reverse("faq-list"))
        data = response.data

        # Assert response
        assert response.status_code == status.HTTP_200_OK
        assert data["count"] == 1
        assert data["results"][0]["id"] == basic_faq.id
        assert other_faq.id not in [faq["id"] for faq in data["results"]]

    def test_get_queryset_unauthenticated(self, api_client):
        """Test that unauthenticated users cannot access FAQs."""
        response = api_client.get(reverse("faq-list"))

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_faq_success(self, basic_faq, user, authenticated_client):
        """Test updating faq."""
        url = reverse("faq-detail", kwargs={"pk": basic_faq.id})

        response = authenticated_client.patch(url, {"content": "Updated", "tone": "formal"})

        assert response.data["content"] == "Updated"
        assert response.data["tone"] != basic_faq.tone
        assert response.status_code == status.HTTP_200_OK

    def test_create_faq_success(self, user, authenticated_client):
        """Test creating faq."""
        payload = {"content": "content", "tone": "formal", "number_of_faqs": 1}
        response = authenticated_client.post(reverse("faq-list"), payload, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["user"] == user.id
        assert response.data["content"] == payload["content"]
        assert response.data["tone"] == payload["tone"]
        assert response.data["number_of_faqs"] == payload["number_of_faqs"]
        assert len(response.data["generated_faqs"]) == payload["number_of_faqs"]

    def test_download_faq(self, basic_faq, authenticated_client):
        """Test downloading FAQ as pdf."""
        url = reverse("faq-download", kwargs={"pk": basic_faq.id})
        response = authenticated_client.get(url)

        assert response.status_code == 200
        assert response["Content-Type"] == "application/pdf"
        assert response["Content-Disposition"] == f'attachment; filename="faq_{basic_faq.id}.pdf"'
