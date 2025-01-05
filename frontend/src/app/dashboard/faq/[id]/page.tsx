'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Mock data for FAQ
const mockFaq = {
    id: 1,
    title: "Company Policy FAQ",
    content: `Our work from home policy allows employees to work remotely up to 2 days per week, subject to manager approval. Employees receive 20 vacation days per year, which increase with tenure. Core working hours are from 10 AM to 4 PM, with flexible start and end times.`,
}

export default function FAQGenerationPage() {
    const params = useParams()
    const { id } = params
    const [faqContent, setFaqContent] = useState(mockFaq.content)
    const [numQuestions, setNumQuestions] = useState(5)
    const [tone, setTone] = useState("neutral")

    const handleGenerateFAQs = () => {
        // Here you would implement the actual FAQ generation logic
        console.log('Generating FAQs with:', { faqContent, numQuestions, tone })
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">FAQ Generation: {mockFaq.title}</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Input Text</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={faqContent}
                            onChange={(e) => setFaqContent(e.target.value)}
                            className="min-h-[200px]"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customization Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        <Button onClick={handleGenerateFAQs} className="w-full">
                            Generate FAQs
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Generated FAQs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-muted-foreground">Your generated FAQs will appear here.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
