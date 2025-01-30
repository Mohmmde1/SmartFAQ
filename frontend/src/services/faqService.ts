import { AppError } from '@/lib/errors'
import { FAQ, FAQStatistics, PaginatedResponse } from '@/types/api'

interface FAQQueryParams {
    page_size?: number;
    search?: string;
    ordering?: string;
}

export const faqService = {
    async generate(data: { content: string; number_of_faqs: number, tone: string }) {
        const response = await fetch("/api/faq", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const result = await response.json()

        if (!response.ok) {
            throw new AppError(
                result.error.message,
                result.error.code,
                result.error.details
            )
        }
        return result
    },

    async getFAQPage(pageNumber: number, params: FAQQueryParams = {}): Promise<PaginatedResponse<FAQ>> {
        const searchParams = new URLSearchParams({
            page: pageNumber.toString(),
            ...(params.page_size && { page_size: params.page_size.toString() }),
            ...(params.search && { search: params.search }),
            ...(params.ordering && { ordering: params.ordering })
        });

        const response = await fetch(`/api/faq?${searchParams.toString()}`);
        const result = await response.json();

        if (!response.ok) {
            throw new AppError(
                result.error.message,
                result.error.code,
                result.error.details
            );
        }
        return result;
    },

    async update(faqContent: string | null, number_of_faqs: number | null, tone: string | null, id: string) {

        const response = await fetch(`/api/faq/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: faqContent,
                number_of_faqs: number_of_faqs,
                tone,
            }),
        })

        const result = await response.json()

        if (!response.ok) {
            throw new AppError(
                result.error.message,
                result.error.code,
                result.error.details
            )
        }

        return result

    },
    async getAll() {
        const response = await fetch("/api/faq")
        const result = await response.json()

        if (!response.ok) {
            throw new AppError(
                result.error.message,
                result.error.code,
                result.error.details
            )
        }
        return result.results;
    },

    async getStatistics(): Promise<FAQStatistics> {
        const response = await fetch("/api/faq/statistics")
        const result = await response.json()

        if (!response.ok) {
            throw new AppError(
                result.error.message,
                result.error.code,
                result.error.details
            )
        }

        return result
    }
}
