import logging
from datetime import datetime, timedelta
from io import BytesIO
from typing import List, Tuple
from urllib.parse import urlparse
from zipfile import Path

import PyPDF2
import requests
from bs4 import BeautifulSoup
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncMonth
from django.template.loader import render_to_string
from sumy.nlp.stemmers import Stemmer
from sumy.nlp.tokenizers import Tokenizer
from sumy.parsers.plaintext import PlaintextParser
from sumy.summarizers.lsa import LsaSummarizer
from sumy.utils import get_stop_words
from weasyprint import CSS, HTML

from .faq_generator import FAQGenerator
from .models import QuestionAnswer

logger = logging.getLogger(__name__)


def generate_faq(text: str, number_of_faqs: int = 5, tone: str = "netural") -> List[QuestionAnswer]:
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

    soup = BeautifulSoup(response.text, "html.parser")
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
        if clean_text.startswith("["):
            clean_text = clean_text.split("]")[-1].strip()
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
        queryset.filter(created_at__gte=six_months_ago)
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )

    daily_trends = list(
        queryset.filter(created_at__gte=seven_days_ago)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    all_days = _process_daily_trends(daily_trends)
    tones = _get_tone_statistics(queryset)

    return {
        "total_faqs": total_faqs,
        "total_questions": total_questions,
        "avg_questions_per_faq": round(avg_questions, 1),
        "last_faq_created": last_faq,
        "monthly_trends": [{"month": item["month"].strftime("%b"), "count": item["count"]} for item in monthly_trends],
        "daily_trends": all_days,
        "tones": tones,
    }


def _process_daily_trends(daily_trends):
    existing_days = {trend["day"]: trend["count"] for trend in daily_trends}
    all_days = []
    for i in range(7):
        day = (datetime.now() - timedelta(days=i)).date()
        all_days.append({"day": day.strftime("%a"), "count": existing_days.get(day, 0)})
    all_days.reverse()
    return all_days


def _get_tone_statistics(queryset):
    tones = list(queryset.values("tone").annotate(value=Count("id")).order_by("-value"))
    return [{"tone": item["tone"] or "Uncategorized", "value": item["value"]} for item in tones]


def validate_url(url: str) -> Tuple[bool, str]:
    """Validate URL format and scheme."""
    try:
        result = urlparse(url)
        if not all([result.scheme, result.netloc]):
            return False, "Invalid URL format. URL must include scheme (http/https) and domain"

        if result.scheme not in ["http", "https"]:
            return False, f"Invalid URL scheme '{result.scheme}'. Only http and https are supported"

        return True, ""
    except Exception:
        return False, "Invalid URL format"


def validate_pdf(pdf_file) -> tuple[bool, str]:
    """Validate PDF file constraints."""
    if not pdf_file or pdf_file.size == 0:
        return False, "PDF file is empty"

    # Check file size (10MB limit)
    if pdf_file.size > 10 * 1024 * 1024:  # 10MB in bytes
        return False, "PDF file size must be less than 10MB"

    # Check file type
    if not pdf_file.name.endswith(".pdf"):
        return False, "File must be a PDF"

    try:
        # Store current position
        pdf_file.seek(0)
        # Check number of pages
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        if len(pdf_reader.pages) > 50:
            return False, "PDF must not exceed 50 pages"

        # Reset file pointer for later reading
        pdf_file.seek(0)
        return True, ""
    except Exception as e:
        return False, f"Invalid PDF file: {str(e)}"

def generate_faq_pdf(faq) -> BytesIO:
    """Generate beautiful PDF file from FAQ using WeasyPrint."""

    # Prepare context for template
    context = {
        "faq": faq,
        "date": datetime.now().strftime("%B %d, %Y"),
        "generated_faqs": faq.generated_faqs.all(),
        "total_questions": faq.generated_faqs.count(),
    }

    # Render HTML from template
    html_string = render_to_string("faq/pdf_template.html", context)

    # Custom CSS for styling
    css_string = """
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :root {
            --primary-color: #2563eb;
            --secondary-color: #4f46e5;
            --text-color: #1f2937;
            --bg-light: #f3f4f6;
            --bg-highlight: #eff6ff;
        }

        .question-wrapper {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            margin-bottom: 1rem;
            padding: 1.5rem;
        }

        .question {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
        }

        .question-icon, .answer-icon {
            font-size: 1.5rem;
            font-weight: 700;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .question-icon {
            background: var(--primary-color);
            color: white;
        }

        .answer-icon {
            background: var(--secondary-color);
            color: white;
        }

        .question-text {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .tags {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.75rem;
            margin-left: 3.5rem;
        }

        .tag {
            background: var(--bg-light);
            color: var(--primary-color);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .answer-wrapper {
            background: var(--bg-highlight);
            border-radius: 12px;
            margin-left: 2rem;
            margin-bottom: 2rem;
            padding: 1.5rem;
        }

        .answer {
            display: flex;
            gap: 1rem;
        }

        .answer-content {
            font-size: 1rem;
            color: var(--text-color);
            line-height: 1.7;
        }

        .highlights {
            margin-top: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            border-left: 4px solid var(--primary-color);
        }

        .highlight-title {
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }

        .highlights ul {
            margin: 0;
            padding-left: 1.25rem;
        }

        .highlights li {
            margin-bottom: 0.25rem;
            color: var(--text-color);
        }

        /* ...rest of existing CSS... */
    """

    # Generate PDF
    buffer = BytesIO()
    HTML(string=html_string).write_pdf(buffer, stylesheets=[CSS(string=css_string)])
    buffer.seek(0)
    return buffer

def extract_text(pdf_file: Path):
    """Reset pdf pointer and extract the text"""
    # File pointer is already at start due to validation
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()

    return text