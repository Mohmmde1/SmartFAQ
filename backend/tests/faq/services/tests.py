import threading
from io import BytesIO
from unittest.mock import Mock, patch

import pytest
from requests.exceptions import RequestException

from faq.exceptions import (
    ConnectionScrapeException,
    FAQGenerationException,
    NoContentScrapeException,
    PdfGenerationException,
    RequestScrapeException,
    ScrapeException,
)
from faq.helpers.faq_generator import FAQGenerator
from faq.services import generate_faq, generate_faq_pdf, scrape_and_summarize


class TestFAQServices:
    @pytest.mark.django_db
    def test_generate_faq(self):
        """Test generate_faq service."""
        text = "This is a test text."
        number_of_faqs = 2
        tone = "neutral"

        faqs = generate_faq(text, number_of_faqs, tone)

        assert len(faqs) == number_of_faqs

    @patch("faq.services.FAQGenerator")
    def test_generate_faq_exception(self, mock_faq_generator_class):
        """Test generate_faq service handles exceptions properly."""
        # Arrange
        mock_instance = Mock()
        mock_instance.generate_faqs.side_effect = Exception("Test error")
        mock_faq_generator_class.return_value = mock_instance

        # Act & Assert
        with pytest.raises(FAQGenerationException) as exc_info:
            generate_faq("Some Text")

        # Verify the mock was called correctly - fix the argument matching
        mock_instance.generate_faqs.assert_called_once_with("Some Text", 5, "neutral")

        # Optional: Verify the error was logged
        assert str(exc_info.value.__cause__) == "Test error"

    @patch("faq.services.requests.get")
    def test_scrape_and_summarize_success(self, mock_get):
        """Test successful scraping and summarization."""
        # Arrange
        expected_content = "This domain is for use in illustrative examples in documents."
        mock_get.return_value.text = f"""
        <html>
            <body>
                <p>{expected_content}</p>
                <p>You may use this domain without permission.</p>
            </body>
        </html>
        """
        mock_get.return_value.status_code = 200
        url = "https://www.example.com"

        # Act
        scraped_content = scrape_and_summarize(url)

        # Assert
        assert expected_content in scraped_content
        mock_get.assert_called_once_with(url, timeout=10)

    @patch("faq.services.requests.get")
    def test_scrape_and_summarize_no_content(self, mock_get):
        """Test scraping with no content."""
        mock_get.return_value.text = "<html><body></body></html>"
        mock_get.return_value.status_code = 200

        with pytest.raises(NoContentScrapeException):
            scrape_and_summarize("https://www.example.com")

    @patch("faq.services.requests.get")
    def test_scrape_and_summarize_connection_error(self, mock_get):
        """Test scraping with connection error."""
        mock_get.side_effect = ConnectionError()

        with pytest.raises(ConnectionScrapeException):
            scrape_and_summarize("https://www.example.com")

    @patch("faq.services.requests.get")
    def test_scrape_and_summarize_request_error(self, mock_get):
        """Test scraping with request error."""
        mock_get.side_effect = RequestException()

        with pytest.raises(RequestScrapeException):
            scrape_and_summarize("https://www.example.com")

    @patch("faq.services.requests.get")
    def test_scrape_and_summarize_exception(self, mock_get):
        """Test scraping with unexpected exception."""
        mock_get.side_effect = Exception()

        with pytest.raises(ScrapeException):
            scrape_and_summarize("https://www.example.com")

    @pytest.mark.django_db
    @patch("faq.services.BytesIO")
    def test_generate_faq_pdf_success(self, mock_bytesio, faq_with_qa):
        """Test generating PDF from FAQ."""
        # Arrange
        mock_buffer = Mock(spec=BytesIO)
        mock_bytesio.return_value = mock_buffer

        # Act
        result = generate_faq_pdf(faq_with_qa)

        # Assert
        assert result == mock_buffer
        mock_buffer.seek.assert_called_once_with(0)

    @pytest.mark.django_db
    @patch("faq.services.BytesIO")
    def test_generate_faq_pdf_exception(self, mock_bytesio, faq_with_qa):
        """Test PdfGeneration exception."""
        mock_bytesio.side_effect = Exception()

        with pytest.raises(PdfGenerationException):
            generate_faq_pdf(faq_with_qa)


class TestFAQGeneratorSingleton:
    """Test suite for FAQGenerator singleton behavior."""

    def test_singleton_instance(self):
        """Test that multiple instantiations return the same instance."""
        # Arrange & Act
        generator1 = FAQGenerator()
        generator2 = FAQGenerator()

        # Assert
        assert generator1 is generator2
        assert id(generator1) == id(generator2)

    def test_singleton_state_sharing(self):
        """Test that state is shared between instances."""
        # Arrange
        generator1 = FAQGenerator()
        generator2 = FAQGenerator()

        # Act
        generator1._test_attribute = "test_value"

        # Assert
        assert hasattr(generator2, "_test_attribute")
        assert generator2._test_attribute == "test_value"

    def test_singleton_thread_safety(self):
        """Test thread-safe singleton instantiation."""
        # Arrange
        instance_ids = []
        thread_count = 10

        def create_instance():
            generator = FAQGenerator()
            instance_ids.append(id(generator))

        # Act
        threads = [threading.Thread(target=create_instance) for _ in range(thread_count)]

        for thread in threads:
            thread.start()

        for thread in threads:
            thread.join()

        # Assert
        assert len(set(instance_ids)) == 1

    @pytest.mark.django_db
    def test_singleton_persistence_across_requests(self):
        """Test singleton maintains state across multiple requests."""
        # Arrange
        text = "Test content"

        # Act
        generator1 = FAQGenerator()
        first_result = generator1.generate_faqs(text, 2, "neutral")

        generator2 = FAQGenerator()
        second_result = generator2.generate_faqs(text, 2, "neutral")

        # Assert - verify both instances use same model/configuration
        assert len(first_result) == len(second_result) == 2
        assert generator1._is_initialized == generator2._is_initialized is True
