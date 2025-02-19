from unittest.mock import patch

import pytest
from requests.exceptions import RequestException

from faq.exceptions import ConnectionScrapeException, NoContentScrapeException, RequestScrapeException
from faq.services import generate_faq, scrape_and_summarize


class TestFAQServices:
    @pytest.mark.skip(reason="This test is currently not working")
    @pytest.mark.django_db
    def test_generate_faq(self):
        """Test generate_faq service."""
        text = "This is a test text."
        number_of_faqs = 2
        tone = "neutral"

        faqs = generate_faq(text, number_of_faqs, tone)

        assert len(faqs) == number_of_faqs

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
