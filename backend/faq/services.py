import logging
from datetime import datetime
from io import BytesIO
from typing import List
from zipfile import Path

import requests
from bs4 import BeautifulSoup
from django.template.loader import render_to_string
from pypdf import PdfReader
from sumy.nlp.stemmers import Stemmer
from sumy.nlp.tokenizers import Tokenizer
from sumy.parsers.plaintext import PlaintextParser
from sumy.summarizers.lsa import LsaSummarizer
from sumy.utils import get_stop_words
from weasyprint import HTML

from .exceptions import (
    ConnectionScrapeException,
    FAQGenerationException,
    NoContentScrapeException,
    ParseException,
    PdfGenerationException,
    RequestScrapeException,
    ScrapeException,
)
from .helpers.faq_generator import FAQGenerator
from .models import QuestionAnswer

logger = logging.getLogger(__name__)


def generate_faq(text: str, number_of_faqs: int = 5, tone: str = "neutral") -> List[QuestionAnswer]:
    """
    Generate FAQs using the FAQGenerator class.
    """
    try:
        generator = FAQGenerator()
        qs = generator.generate_faqs(text, number_of_faqs, tone)
    except Exception as err:
        raise FAQGenerationException() from err

    return qs


def scrape_and_summarize(url: str) -> str:
    """Scrape URL and return summarized content."""
    logger.info(f"Scraping URL: {url}")

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        text = " ".join([p.get_text(strip=True) for p in soup.find_all("p")])

        if not text:
            logger.warning(f"No content found to summarize for URL: {url}")
            raise NoContentScrapeException()

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

    except ConnectionError as err:
        logger.error(f"Connection failed for URL: {url}")
        raise ConnectionScrapeException() from err

    except requests.RequestException as err:
        logger.error(f"Request failed for URL: {url}")
        raise RequestScrapeException() from err
    except NoContentScrapeException as err:
        logger.error(f"No content has been found: {url}")
        raise NoContentScrapeException() from err
    except Exception as err:
        logger.exception(f"Unexpected error scraping URL: {url}")
        raise ScrapeException() from err


def generate_faq_pdf(faq) -> BytesIO:
    """Generate beautiful PDF file from FAQ using WeasyPrint."""

    try:
        context = {
            "faq": faq,
            "date": datetime.now().strftime("%B %d, %Y"),
            "generated_faqs": faq.generated_faqs.all(),
            "total_questions": faq.generated_faqs.count(),
        }

        html_string = render_to_string("faq/pdf_template.html", context)

        buffer = BytesIO()
        HTML(string=html_string).write_pdf(buffer)
        buffer.seek(0)
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise PdfGenerationException() from e

    return buffer


def extract_text(pdf_file: Path) -> str:
    """Extract text from PDF file."""
    try:
        pdf_reader = PdfReader(pdf_file)  # Updated class name
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()

        if not text.strip():
            raise ParseException("No text content found in PDF")

        return text

    except Exception as e:
        logger.error("Error processing PDF: %s", str(e))
        raise ParseException() from e
