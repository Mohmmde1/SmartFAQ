import { type Dispatch, type SetStateAction, useState } from 'react'
import { toast } from 'sonner'
import { faqService } from '@/services/faqService'
import { AppError } from '@/lib/errors'
import { FAQ } from '@/types/api'

export function useFAQGeneration(
    faqs: FAQ[],
    setFaqs: (faqs: FAQ[]) => void
) {
    const [inputText, setInputText] = useState('')
    const [numQuestions, setNumQuestions] = useState(5)
    const [tone, setTone] = useState("neutral")
    const [isLoading, setIsLoading] = useState(false)

    const handleGenerate = async () => {
        setIsLoading(true)
        try {
            const result = await faqService.generate({
                content: inputText,
                number_of_faqs: numQuestions,
            })

            setFaqs([...faqs, result])

            // Reset form
            setInputText('')
            setNumQuestions(5)
            setTone('neutral')

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
