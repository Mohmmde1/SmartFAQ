from datetime import datetime, timedelta

from django.db import models
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncMonth


class FAQManager(models.Manager):
    def get_user_faqs(self, user) -> models.QuerySet:
        """Get FAQs for a specific user."""
        return self.filter(user=user).order_by("-created_at").prefetch_related("generated_faqs")

    def get_monthly_trends(self, queryset=None) -> models.QuerySet:
        """Get monthly trends for the last 6 months."""
        qs = queryset if queryset is not None else self.all()
        six_months_ago = datetime.now() - timedelta(days=180)

        return (
            qs.filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

    def get_daily_trends(self, queryset=None) -> models.QuerySet:
        """Get daily trends for the last 7 days."""
        qs = queryset if queryset is not None else self.all()
        seven_days_ago = datetime.now() - timedelta(days=7)

        return (
            qs.filter(created_at__gte=seven_days_ago)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

    def get_tone_distribution(self, queryset=None) -> models.QuerySet:
        """Get tone distribution statistics."""
        qs = queryset if queryset is not None else self.all()
        return qs.values("tone").annotate(value=Count("id")).order_by("-value")
