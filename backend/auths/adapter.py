import logging

from allauth.account.models import EmailAddress
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        This method is triggered before a social login attempt.
        It checks if an existing user is registered with the same email and links the account.
        """
        email = sociallogin.account.extra_data.get("email")

        if not email:
            logger.warning("Social login attempt without an email. Skipping process.")
            return  # No email found, skip further processing

        email_address = EmailAddress.objects.filter(email=email).first()
        if email_address:
            user = email_address.user

            # If the social login is new but the email exists, link accounts
            if not sociallogin.is_existing:
                logger.info(f"Linking social account for existing user: {email}")
                sociallogin.connect(request, user)

                # Mark email as verified for trusted providers like Google
                email_address.verified = True
                email_address.save()
            else:
                logger.info(f"User {email} already has a linked social account.")
        else:
            logger.info(f"No existing user found for email {email}. Proceeding with normal signup.")
