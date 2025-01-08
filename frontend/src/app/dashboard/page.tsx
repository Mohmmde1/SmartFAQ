'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'

import { toast } from 'sonner'
import { AppError } from '@/lib/errors'

// Mock data for recent FAQs
const recentFaqs = [
    {
        id: 1,
        title: "Company Policy FAQ",
        preview: [
            "Q: What is our work from home policy?",
            "Q: How many vacation days do employees get?",
            "Q: What are the core working hours?"
        ]
    },
    {
        id: 2,
        title: "Product Features FAQ",
        preview: [
            "Q: What platforms does the product support?",
            "Q: Is there a free trial available?",
            "Q: How often are updates released?"
        ]
    },
    {
        id: 3,
        title: "Customer Support FAQ",
        preview: [
            "Q: How do I reset my password?",
            "Q: What payment methods do you accept?",
            "Q: How long does shipping usually take?"
        ]
    }
]

export default function Dashboard() {
    const [inputText, setInputText] = useState('')
    const [numQuestions, setNumQuestions] = useState(5)
    const [tone, setTone] = useState("neutral")
    const [isLoading, setIsLoading] = useState(false)

    const handleGenerateFAQs = async () => {
        // Handle FAQ generation logic here
        console.log('Generating FAQs for:', { inputText, numQuestions, tone })
        setIsLoading(true);
        try {
            const data = {
                content: inputText,
                no_of_faqs: numQuestions,
            }
            const response = await fetch("api/faq", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },)
            const result = await response.json()

            if (!response.ok) {
                throw new AppError(
                    result.error.message,
                    result.error.code,
                    result.error.details
                );
            }
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

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Generate FAQs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="text-input">Enter your text</Label>
                                <Textarea
                                    id="text-input"
                                    placeholder="Paste your text here or upload a file"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="min-h-[200px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="num-questions">Number of Questions</Label>
                                <Slider
                                    id="num-questions"
                                    min={1}
                                    max={20}
                                    step={1}
                                    value={[numQuestions]}
                                    onValueChange={(value) => setNumQuestions(value[0])}
                                />
                                <div className="text-sm text-muted-foreground">{numQuestions} questions</div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tone">Tone</Label>
                                <Select value={tone} onValueChange={setTone}>
                                    <SelectTrigger id="tone">
                                        <SelectValue placeholder="Select tone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="formal">Formal</SelectItem>
                                        <SelectItem value="casual">Casual</SelectItem>
                                        <SelectItem value="neutral">Neutral</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleGenerateFAQs} disabled={isLoading} className="w-full">
                                {isLoading ? 'Generating FAQs' : 'Generate FAQs'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent FAQs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentFaqs.map((faq) => (
                                <div key={faq.id} className="space-y-2">
                                    <h3 className="text-lg font-semibold">{faq.title}</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {faq.preview.map((question, index) => (
                                            <li key={index} className="text-sm text-muted-foreground">
                                                {question}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/faq/${faq.id}`}>View Full FAQ</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
