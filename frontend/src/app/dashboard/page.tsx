'use client'

import { useFAQs } from '@/hooks/useFAQs'
import { FAQGenerator } from '@/components/faq/faq-generator'
import { FAQList } from '@/components/faq/faq-list'
import { useFAQGeneration } from '@/hooks/useFAQGeneration'

export default function Dashboard() {
    const { faqs, setFaqs, isFetchingFaqs, hasMore, ref } = useFAQs()
    const faqGeneration = useFAQGeneration(faqs, setFaqs)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid gap-8 lg:grid-cols-2">
                <FAQGenerator
                    inputText={faqGeneration.inputText}
                    setInputText={faqGeneration.setInputText}
                    numQuestions={faqGeneration.numQuestions}
                    setNumQuestions={faqGeneration.setNumQuestions}
                    tone={faqGeneration.tone}
                    setTone={faqGeneration.setTone}
                    isLoading={faqGeneration.isLoading}
                    onGenerate={faqGeneration.handleGenerate}
                />

                <FAQList
                    faqs={faqs}
                    isFetchingFaqs={isFetchingFaqs}
                    hasMore={hasMore}
                    scrollRef={ref}
                />
            </div>
        </div>
    )
}
