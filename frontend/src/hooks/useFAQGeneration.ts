import { useState } from 'react'
import { toast } from 'sonner'
import { faqService } from '@/services/faqService'
import { AppError } from '@/lib/errors'
import { FAQ } from '@/types/api'

export function useFAQGeneration(
    onSuccess: () => void
) {
    const [inputText, setInputText] = useState('')
    const [numQuestions, setNumQuestions] = useState(5)
    const [tone, setTone] = useState("neutral")
    const [isLoading, setIsLoading] = useState(false)

    const handleGenerate = async () => {
        setIsLoading(true)
        try {
            await faqService.generate({
                content: inputText,
                number_of_faqs: numQuestions,
                tone: tone
            })

            // Reset form
            setInputText('')
            setNumQuestions(5)
            setTone('neutral')

            // Trigger refresh of FAQ list
            onSuccess()
            toast.success("FAQs generated successfully!")
        } catch (error) {
            if (error instanceof AppError) {
                toast.error(error.message)
                if (error.details) {
                    Object.entries(error.details).forEach(([field, messages]) => {
                        toast.error(`${field}: ${messages.join(', ')}`)
                    })
                }
            } else {
                toast.error('An unexpected error occurred')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return {
        inputText,
        setInputText,
        numQuestions,
        setNumQuestions,
        tone,
        setTone,
        isLoading,
        handleGenerate
    }
}
