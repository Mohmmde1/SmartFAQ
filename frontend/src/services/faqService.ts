import { AppError } from '@/lib/errors'
import { FAQ, PaginatedResponse } from '@/types/api'

export const faqService = {
    async generate(data: { content: string; number_of_faqs: number }) {
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

    async getFAQPage(pageNumber: number): Promise<PaginatedResponse<FAQ>> {
        const response = await fetch(`/api/faq?page=${pageNumber}`)
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
    }
}
