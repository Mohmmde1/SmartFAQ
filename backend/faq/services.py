import logging
from datetime import datetime, timedelta
from typing import List

import requests
from bs4 import BeautifulSoup
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncMonth
from sumy.nlp.stemmers import Stemmer
from sumy.nlp.tokenizers import Tokenizer
from sumy.parsers.plaintext import PlaintextParser
from sumy.summarizers.lsa import LsaSummarizer
from sumy.utils import get_stop_words

from .faq_generator import FAQGenerator
from .models import QuestionAnswer

logger = logging.getLogger(__name__)

def generate_faq(text: str, number_of_faqs: int = 5, tone: str='netural') -> List[QuestionAnswer]:
    """
    Generate FAQs using the FAQGenerator class.

    Args:
        text (str): Input text to generate FAQs from.
        number_of_faqs (int): Number of FAQs to generate.

    Returns:
        List[QuestionAnswer]: List of QuestionAnswer objects with generated FAQs.
    """
    generator = FAQGenerator()
    return generator.generate_faqs(text, number_of_faqs, tone)

def scrape_and_summarize(url: str, user_email: str) -> str:
    """Scrape URL and return summarized content."""
    logger.info(f"Scraping URL: {url} for user {user_email}")

    response = requests.get(url, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')
    text = " ".join([p.get_text(strip=True) for p in soup.find_all("p")])

    if not text:
        return "No content found to summarize"

    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    stemmer = Stemmer("english")
    summarizer = LsaSummarizer(stemmer)
    summarizer.stop_words = get_stop_words("english")

    summary = summarizer(parser.document, 4)
    cleaned_summary = []
    for sentence in summary:
        clean_text = str(sentence)
        if clean_text.startswith('['):
            clean_text = clean_text.split(']')[-1].strip()
        cleaned_summary.append(clean_text)

    return " ".join(cleaned_summary)

def get_faq_statistics(queryset) -> dict:
    """Get FAQ statistics."""
    total_faqs = queryset.count()
    total_questions = sum(faq.generated_faqs.count() for faq in queryset)
    avg_questions = total_questions / total_faqs if total_faqs > 0 else 0
    last_faq = queryset.first()

    # Trends
    six_months_ago = datetime.now() - timedelta(days=180)
    seven_days_ago = datetime.now() - timedelta(days=7)

    monthly_trends = list(
        queryset
        .filter(created_at__gte=six_months_ago)
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )

    daily_trends = list(
        queryset
        .filter(created_at__gte=seven_days_ago)
        .annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )

    all_days = _process_daily_trends(daily_trends)
    tones = _get_tone_statistics(queryset)

    return {
        'total_faqs': total_faqs,
        'total_questions': total_questions,
        'avg_questions_per_faq': round(avg_questions, 1),
        'last_faq_created': last_faq,
        'monthly_trends': [
            {'month': item['month'].strftime('%b'), 'count': item['count']}
            for item in monthly_trends
        ],
        'daily_trends': all_days,
        'tones': tones
    }

def _process_daily_trends(daily_trends):
    existing_days = {trend['day']: trend['count'] for trend in daily_trends}
    all_days = []
    for i in range(7):
        day = (datetime.now() - timedelta(days=i)).date()
        all_days.append({
            'day': day.strftime('%a'),
            'count': existing_days.get(day, 0)
        })
    all_days.reverse()
    return all_days

def _get_tone_statistics(queryset):
    tones = list(
        queryset
        .values('tone')
        .annotate(value=Count('id'))
        .order_by('-value')
    )
    return [
        {'tone': item['tone'] or 'Uncategorized', 'value': item['value']}
        for item in tones
    ]
