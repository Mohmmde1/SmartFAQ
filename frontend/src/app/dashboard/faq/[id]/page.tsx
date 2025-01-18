'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppError } from '@/lib/errors'
import { FAQ } from '@/types/api'
import { toast } from "sonner"
import { LoadingSkeleton } from '@/components/faq/loading-skeleton'
import { FAQInput } from '@/components/faq/faq-input'
import { FAQOptions } from '@/components/faq/faq-options'
import { GeneratedFAQs } from '@/components/faq/generated-faqs'

export default function FAQGenerationPage() {
    const params = useParams()
    const { id } = params
    const [faq, setFaq] = useState<FAQ | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [faqContent, setFaqContent] = useState('')
    const [numQuestions, setNumQuestions] = useState(5)
    const [tone, setTone] = useState("neutral")

    useEffect(() => {
        const fetchFaq = async () => {
            try {
                const response = await fetch(`/api/faq/${id}`)
                const data = await response.json()

                if (!response.ok) {
                    throw new AppError(
                        data.error.message,
                        data.error.code,
                        data.error.details
                    )
                }
                setFaq(data)
                setFaqContent(data.content)
            } catch (error) {
                if (error instanceof AppError) {
                    toast.error(error.message)
                } else {
                    toast.error('Failed to fetch FAQ')
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchFaq()
    }, [id])

    const handleGenerateFAQs = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/faq/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: faqContent,
                    number_of_faqs: numQuestions,
                    tone,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new AppError(
                    data.error.message,
                    data.error.code,
                    data.error.details
                )
            }

            setFaq(data)
            toast.success('FAQs generated successfully!')
        } catch (error) {
            if (error instanceof AppError) {
                toast.error(error.message)
            } else {
                toast.error('Failed to generate FAQs')
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <LoadingSkeleton />
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">FAQ Generation: {faq?.title}</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <FAQInput
                    content={faqContent}
                    onChange={setFaqContent}
                />
                <FAQOptions
                    numQuestions={numQuestions}
                    tone={tone}
                    onQuestionsChange={setNumQuestions}
                    onToneChange={setTone}
                    onGenerate={handleGenerateFAQs}
                />
                {faq && (
                    <GeneratedFAQs
                        faqs={faq.generated_faqs}
                    />
                )}
            </div>
        </div>
    )
}
