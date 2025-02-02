import { AppError } from '@/lib/errors'

interface ScrapeResponse {
    content: string;
}

export const scrapeService = {
    async scrape(url: string): Promise<ScrapeResponse> {
        const response = await fetch("/api/scrape", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new AppError(
                result.error.message,
                result.error.code,
                result.error.details
            );
        }

        return result;
    }
};
