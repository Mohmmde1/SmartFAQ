import { useState, useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { FAQ, PaginatedResponse } from '@/types/api'
import { AppError } from '@/lib/errors'
import { toast } from 'sonner'
import { faqService } from '@/services/faqService'
import { useQuery } from '@tanstack/react-query'

interface UseFAQsParams {
    page?: number
    pageSize?: number
    search?: string
    ordering?: string
}

export function useFAQs({
    page = 1,
    pageSize = 10,
    search = '',
    ordering
}: UseFAQsParams = {}) {
    const { data, isLoading, error } = useQuery<PaginatedResponse<FAQ>>({
        queryKey: ['faqs', page, pageSize, search, ordering],
        queryFn: () => faqService.getFAQPage(page, {
            page_size: pageSize,
            search,
            ordering
        }),
    })

    return {
        faqs: data,
        isLoading,
        error: error instanceof Error ? error.message : null
    }
}
