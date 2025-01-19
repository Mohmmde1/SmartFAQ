'use client'

import { useFAQs } from '@/hooks/useFAQs'
import { FAQGenerator } from '@/components/faq/faq-generator'
import { FAQList } from '@/components/faq/faq-list'
import { useState } from 'react'
import { AppError } from '@/lib/errors'
import { toast } from 'sonner'

export default function Dashboard() {
    const [inputText, setInputText] = useState('')
    const [numQuestions, setNumQuestions] = useState(5)
    const [tone, setTone] = useState("neutral")
    const [isLoading, setIsLoading] = useState(false)

    const { faqs, setFaqs, isFetchingFaqs, hasMore, ref } = useFAQs()

    const handleGenerateFAQs = async () => {
        setIsLoading(true);
        try {
            const data = {
                content: inputText,
                number_of_faqs: numQuestions,
            }
            console.log(data)
            const response = await fetch("api/faq", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            const result = await response.json()

            if (!response.ok) {
                throw new AppError(
                    result.error.message,
                    result.error.code,
                    result.error.details
                );
            }

            // Fetch updated FAQs
            const updatedResponse = await fetch("/api/faq");
            const updatedResult = await updatedResponse.json();

            if (!updatedResponse.ok) {
                throw new AppError(
                    updatedResult.error.message,
                    updatedResult.error.code,
                    updatedResult.error.details
                );
            }

            // Update state
            setFaqs(updatedResult);
            setInputText(''); // Clear input
            setNumQuestions(5); // Reset to default
            setTone('neutral'); // Reset tone

            toast.success("FAQs generated successfully!");
        } catch (error: unknown) {
            if (error instanceof AppError) {
                toast.error(error.message);
                // Handle field-specific errors
                if (error.details) {
                    Object.entries(error.details).forEach(([field, messages]) => {
                        toast.error(`${field}: ${messages.join(', ')}`);
                    });
                }
            } else {
                toast.error('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid gap-8 lg:grid-cols-2">
                <FAQGenerator
                    inputText={inputText}
                    setInputText={setInputText}
                    numQuestions={numQuestions}
                    setNumQuestions={setNumQuestions}
                    tone={tone}
                    setTone={setTone}
                    isLoading={isLoading}
                    onGenerate={handleGenerateFAQs}
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
