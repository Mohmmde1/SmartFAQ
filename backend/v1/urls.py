from allauth.account.views import ConfirmEmailView
from django.urls import include, path, re_path

from . import views

urlpatterns = [
    path("auth/", include("dj_rest_auth.urls")),
    re_path(
        "^auth/registration/account-confirm-email/(?P<key>[-:\w]+)/$",
        ConfirmEmailView.as_view(),
        name="account_confirm_email",
    ),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
    path("auth/google/", views.GoogleLogin.as_view(), name="google_login"),
    path("faq/", include("faq.urls")),
]
