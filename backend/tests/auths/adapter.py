from unittest.mock import Mock, patch

import pytest

from auths.adapter import CustomSocialAccountAdapter


@pytest.fixture
def mock_request():
    return Mock()


@pytest.fixture
def adapter():
    return CustomSocialAccountAdapter()


@pytest.fixture
def mock_sociallogin():
    sociallogin = Mock()
    sociallogin.account = Mock()
    sociallogin.account.extra_data = {}
    sociallogin.is_existing = False
    return sociallogin


@pytest.mark.django_db
class TestCustomSocialAccountAdapter:
    @patch("auths.adapter.logger")
    def test_pre_social_login_no_email(self, mock_logger, adapter, mock_request, mock_sociallogin):
        # Setup
        mock_sociallogin.account.extra_data["email"] = None

        # Execute
        adapter.pre_social_login(mock_request, mock_sociallogin)

        # Assert
        mock_logger.warning.assert_called_once_with("Social login attempt without an email. Skipping process.")

    @patch("auths.adapter.EmailAddress")
    @patch("auths.adapter.logger")
    def test_pre_social_login_existing_email_new_social(
        self, mock_logger, mock_email_address, adapter, mock_request, mock_sociallogin
    ):
        # Setup
        email = "test@example.com"
        mock_sociallogin.account.extra_data["email"] = email
        mock_user = Mock()
        mock_email_obj = Mock(user=mock_user)
        mock_email_address.objects.filter.return_value.first.return_value = mock_email_obj

        # Execute
        adapter.pre_social_login(mock_request, mock_sociallogin)

        # Assert
        mock_sociallogin.connect.assert_called_once_with(mock_request, mock_user)
        mock_email_obj.save.assert_called_once()
        assert mock_email_obj.verified is True
        mock_logger.info.assert_called_once_with(f"Linking social account for existing user: {email}")

    @patch("auths.adapter.EmailAddress")
    @patch("auths.adapter.logger")
    def test_pre_social_login_existing_email_existing_social(
        self, mock_logger, mock_email_address, adapter, mock_request, mock_sociallogin
    ):
        # Setup
        email = "test@example.com"
        mock_sociallogin.account.extra_data["email"] = email
        mock_sociallogin.is_existing = True
        mock_email_address.objects.filter.return_value.first.return_value = Mock(user=Mock())

        # Execute
        adapter.pre_social_login(mock_request, mock_sociallogin)

        # Assert
        mock_logger.info.assert_called_once_with(f"User {email} already has a linked social account.")

    @patch("auths.adapter.EmailAddress")
    @patch("auths.adapter.logger")
    def test_pre_social_login_new_email(self, mock_logger, mock_email_address, adapter, mock_request, mock_sociallogin):
        # Setup
        email = "test@example.com"
        mock_sociallogin.account.extra_data["email"] = email
        mock_email_address.objects.filter.return_value.first.return_value = None

        # Execute
        adapter.pre_social_login(mock_request, mock_sociallogin)

        # Assert
        mock_logger.info.assert_called_once_with(
            f"No existing user found for email {email}. Proceeding with normal signup."
        )
