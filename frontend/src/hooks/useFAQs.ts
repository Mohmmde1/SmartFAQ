import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { FAQ, PaginatedResponse } from '@/types/api'
import { AppError } from '@/lib/errors'
import { toast } from 'sonner'
import { faqService } from '@/services/faqService'

export function useFAQs() {
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [isFetchingFaqs, setIsFetchingFaqs] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const { ref, inView } = useInView()

    const fetchFAQs = async (pageNumber: number) => {
        try {
            const data = await faqService.getFAQPage(pageNumber)

            // Add null check and ensure results is an array
            if (!data || !Array.isArray(data.results)) {
                setHasMore(false)
                return
            }

            // Check for next page
            setHasMore(!!data.next)

            // Update FAQs safely
            setFaqs(prev => pageNumber === 1 ?
                data.results :
                [...prev, ...(data.results || [])]
            )
            setPage(pageNumber)

        } catch (error) {
            if (error instanceof AppError) {
                toast.error(error.message)
            } else {
                toast.error('Failed to fetch FAQs')
            }
        } finally {
            setIsFetchingFaqs(false)
        }
    }

    useEffect(() => {
        fetchFAQs(1)
    }, [])

    useEffect(() => {
        if (inView && hasMore && !isFetchingFaqs) {
            fetchFAQs(page + 1)
        }
    }, [inView, hasMore, isFetchingFaqs])

    return {
        faqs,
        setFaqs,
        isFetchingFaqs,
        hasMore,
        ref
    }
}
