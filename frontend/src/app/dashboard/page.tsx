'use client'

import { useEffect, useState } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { FAQ } from '@/types/api'

export default function Dashboard() {
    const [inputText, setInputText] = useState('')
    const [numQuestions, setNumQuestions] = useState(5)
    const [tone, setTone] = useState("neutral")
    const [isLoading, setIsLoading] = useState(false)
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [isFetchingFaqs, setIsFetchingFaqs] = useState(true)

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const response = await fetch("/api/faq");
                const result = await response.json();

                if (!response.ok) {
                    throw new AppError(
                        result.error.message,
                        result.error.code,
                        result.error.details
                    );
                }
                console.log('FAQs:', result)
                setFaqs(result);
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

        fetchFAQs();
    }, []);

    const handleGenerateFAQs = async () => {
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
            // ...existing error handling...
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
                {/* First Card - FAQ Generator */}
                <Card className="w-full">
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

                {/* Second Card - Recent FAQs */}
                <Card className="w-full h-[600px] flex flex-col">
                    <CardHeader className="border-b">
                        <CardTitle>Recent FAQs</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        {isFetchingFaqs ? (
                            <div className="p-4">Loading FAQs...</div>
                        ) : (
                            <ScrollArea className="h-[500px]">
                                <div className="divide-y">
                                    {faqs.map((faq) => (
                                        <div key={faq.id} className="p-4 hover:bg-muted/50">
                                            <div className="max-w-[calc(100%-2rem)] space-y-2">
                                                <h3 className="text-lg font-semibold truncate">{faq.title}</h3>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {faq.generated_faqs.slice(0, 3).map((qa, index) => (
                                                        <li key={index} className="text-sm text-muted-foreground line-clamp-1">
                                                            {qa.question}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <Button variant="outline" size="sm" className="mt-2">
                                                    <Link href={`/dashboard/faq/${faq.id}`} className="w-full">
                                                        View Full FAQ
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
