from allauth.account import app_settings as allauth_account_settings
from allauth.account.adapter import get_adapter
from allauth.account.models import EmailAddress
from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers


class CustomRegisterSerializer(RegisterSerializer):
    def validate_email(self, email):
        """Overrides the default email validation to remove the verification check."""
        email = get_adapter().clean_email(email)

        if allauth_account_settings.UNIQUE_EMAIL:
            email_address = EmailAddress.objects.filter(email=email).first()  # Get first matching email

            if email_address:
                if email_address.verified:
                    raise serializers.ValidationError("A user is already registered with this e-mail address.")
                else:
                    raise serializers.ValidationError(
                        "This email exists but has not been verified yet! Please verify it first."
                    )

        return email
