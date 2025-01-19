import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { FAQ } from '@/types/api'
import { AppError } from '@/lib/errors'
import { toast } from 'sonner'

export function useFAQs() {
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [isFetchingFaqs, setIsFetchingFaqs] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const { ref, inView } = useInView()

    const fetchFAQs = async (pageNumber: number) => {
        try {
            const response = await fetch(`/api/faq?page=${pageNumber}`);
            const result = await response.json();

            if (!response.ok) {
                if (result.error.code === 'INVALID_PAGE') {
                    setHasMore(false);
                    return;
                }
                throw new AppError(
                    result.error.message,
                    result.error.code,
                    result.error.details
                );
            }

            setFaqs(prev => pageNumber === 1 ? result : [...prev, ...result]);
            setPage(pageNumber);
        } catch (error) {
            if (error instanceof AppError) {
                toast.error(error.message);
            } else {
                toast.error('Failed to fetch FAQs');
            }
        } finally {
            setIsFetchingFaqs(false);
        }
    };

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
