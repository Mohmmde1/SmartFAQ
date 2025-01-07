# faq/models.py
from django.contrib.auth import get_user_model
from django.db import models

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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='faqs')
    title = models.CharField(max_length=255)
    content = models.TextField()
    generated_faqs = models.ManyToManyField(QuestionAnswer, blank=True)

    def __str__(self):
        return self.title

    @property
    def number_of_faqs(self):
        return self.generated_faqs.count()
