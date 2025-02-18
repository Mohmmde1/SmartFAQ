# faq/models.py
from django.contrib.auth import get_user_model
from django.db import models

from .managers import FAQManager

User = get_user_model()


class ModelBase(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class QuestionAnswer(ModelBase):
    question = models.CharField(max_length=255)
    answer = models.TextField()

    def __str__(self):
        return self.question


class FAQ(ModelBase):
    TONE_CHOICES = [
        ("formal", "Formal"),
        ("neutral", "Neutral"),
        ("casual", "Casual"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="faqs")
    title = models.CharField(max_length=255)
    content = models.TextField()
    generated_faqs = models.ManyToManyField(QuestionAnswer, blank=True)
    number_of_faqs = models.PositiveIntegerField(default=3)
    tone = models.CharField(choices=TONE_CHOICES, default="neutral")
    category = models.CharField(max_length=255, default="General")

    objects = FAQManager()

    def __str__(self):
        return self.title
