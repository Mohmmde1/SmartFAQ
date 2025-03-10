import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APIRequestFactory

from faq.models import FAQ, QuestionAnswer
from faq.serializers import QuestionAnswerSerializer

User = get_user_model()


@pytest.fixture
def user():
    """Fixture for creating a test user."""
    return User.objects.create_user(email="testuser@mail.com", password="testpass")


@pytest.fixture
def basic_faq(user):
    """Fixture for creating a basic FAQ instance."""
    return FAQ.objects.create(user=user, title="Test FAQ", content="Test content")


@pytest.fixture
def question_answers():
    """Fixture for creating sample question-answer pairs."""
    return [
        QuestionAnswer.objects.create(question="What is SmartFAQ?", answer="A FAQ generator."),
        QuestionAnswer.objects.create(question="How does it work?", answer="It uses AI."),
    ]


@pytest.fixture
def question_answer():
    """Fixture for creating a basic question-answer"""
    return QuestionAnswer.objects.create(question="What is SmartFAQ?", answer="A FAQ generator.")


@pytest.fixture
def faq_with_qa(basic_faq, question_answers):
    """Fixture for creating a FAQ instance with question-answer pairs."""
    basic_faq.generated_faqs.add(*question_answers)
    return basic_faq


@pytest.fixture
def faq_queryset(faq_with_qa):
    for _ in range(9):
        faq_with_qa.id = None
        faq_with_qa.save()
    return FAQ.objects.all()


@pytest.fixture
def api_factory():
    """Return APIRequestFactory instance."""
    return APIRequestFactory()


@pytest.fixture
def api_client():
    """Return APIClient instance."""
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, user):
    """Return authenticated APIClient."""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def qa_serialized(question_answer):
    """Serialized question answer."""
    return QuestionAnswerSerializer(question_answer)
