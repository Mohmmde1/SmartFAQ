from django.contrib import admin

from .models import FAQ, QuestionAnswer


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("title", "created_at", "updated_at")
    search_fields = ("title", "content")


@admin.register(QuestionAnswer)
class QuestionAnswerAdmin(admin.ModelAdmin):
    list_display = ("question", "created_at")
    search_fields = ("question", "answer")
