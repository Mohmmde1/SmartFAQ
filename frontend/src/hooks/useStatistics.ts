import { useQuery } from '@tanstack/react-query'
import { faqService } from '@/services/faqService'
import { FAQStatistics } from '@/types/api'

export function useStatistics() {
    return useQuery<FAQStatistics>({
        queryKey: ['faq-statistics'],
        queryFn: () => faqService.getStatistics()
    })
}
