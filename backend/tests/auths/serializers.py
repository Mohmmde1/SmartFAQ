from unittest.mock import Mock, patch

import pytest
from rest_framework.exceptions import ValidationError

from auths.serializers import CustomRegisterSerializer


@pytest.fixture
def serializer():
    return CustomRegisterSerializer()


@pytest.fixture
def mock_adapter():
    """Setup mock adapter with return value"""
    mock = Mock()
    with patch("auths.serializers.get_adapter", return_value=mock) as _:
        yield mock


@pytest.fixture
def mock_email_filter():
    """Setup mock for email filter"""
    with patch("auths.serializers.EmailAddress.objects.filter") as mock:
        yield mock


@pytest.mark.django_db
class TestCustomRegisterSerializer:
    def setup_email_mock(self, mock_email_filter, verified=False):
        """Helper method to setup email mock state"""
        mock_email = Mock()
        mock_email.verified = verified
        mock_email_filter.return_value.first.return_value = mock_email
        return mock_email

    def test_validate_email_with_new_email(self, serializer, mock_adapter, mock_email_filter):
        """Test when the email is unique and valid."""
        test_email = "new@example.com"
        mock_adapter.clean_email.return_value = test_email
        mock_email_filter.return_value.first.return_value = None

        result = serializer.validate_email(test_email)

        assert result == test_email
        mock_adapter.clean_email.assert_called_once_with(test_email)

    def test_validate_email_with_verified_existing_email(self, serializer, mock_adapter, mock_email_filter):
        """Test when the email is already verified."""
        test_email = "existing@example.com"
        mock_adapter.clean_email.return_value = test_email
        self.setup_email_mock(mock_email_filter, verified=True)

        with pytest.raises(ValidationError) as exc_info:
            serializer.validate_email(test_email)

        assert str(exc_info.value.detail[0]) == "A user is already registered with this e-mail address."
        mock_adapter.clean_email.assert_called_once_with(test_email)

    def test_validate_email_with_unverified_existing_email(self, serializer, mock_adapter, mock_email_filter):
        """Test when the email exists but is not verified."""
        test_email = "unverified@example.com"
        mock_adapter.clean_email.return_value = test_email
        self.setup_email_mock(mock_email_filter, verified=False)

        with pytest.raises(ValidationError) as exc_info:
            serializer.validate_email(test_email)

        assert (
            str(exc_info.value.detail[0]) == "This email exists but has not been verified yet! Please verify it first."
        )
        mock_adapter.clean_email.assert_called_once_with(test_email)

    def test_validate_email_with_invalid_email(self, serializer, mock_adapter):
        """Test when an invalid email is provided."""
        test_email = "invalid-email"
        mock_adapter.clean_email.side_effect = ValidationError("Enter a valid email address.")

        with pytest.raises(ValidationError):
            serializer.validate_email(test_email)
