import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestCustomUserManager:
    def test_create_user(self):
        user = User.objects.create_user(email="test@example.com", password="testpass123")
        assert user.email == "test@example.com"
        assert not user.is_staff
        assert not user.is_superuser
        assert user.check_password("testpass123")

    def test_create_user_no_email(self):
        with pytest.raises(ValueError) as excinfo:
            User.objects.create_user(email="", password="testpass123")
        assert str(excinfo.value) == "Email must be set"

    def test_create_superuser(self):
        admin_user = User.objects.create_superuser(email="admin@example.com", password="testpass123")
        assert admin_user.email == "admin@example.com"
        assert admin_user.is_staff
        assert admin_user.is_superuser

    def test_create_superuser_not_staff(self):
        with pytest.raises(ValueError) as excinfo:
            User.objects.create_superuser(email="admin@example.com", password="testpass123", is_staff=False)
        assert str(excinfo.value) == "Superuser must have is_staff=True."

    def test_create_superuser_not_superuser(self):
        with pytest.raises(ValueError) as excinfo:
            User.objects.create_superuser(email="admin@example.com", password="testpass123", is_superuser=False)
        assert str(excinfo.value) == "Superuser must have is_superuser=True."
