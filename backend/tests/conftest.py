import pytest
from django.contrib.auth import get_user_model

from faq.models import FAQ, QuestionAnswer

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
