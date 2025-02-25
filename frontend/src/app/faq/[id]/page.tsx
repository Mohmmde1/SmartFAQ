'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';
import { GeneratedFAQs } from '@/components/faq/generated-faqs';
import { FAQ, QuestionAnswer } from '@/types/api';
import { WebSocketMessage } from '@/types/websocket';
import { FAQInput } from '@/components/faq/faq-input';
import { FAQOptions } from '@/components/faq/faq-options';
import { useParams } from 'next/navigation';
import { AppError } from '@/lib/errors';
import { scrapeService } from '@/services/scrapeService';
import { pdfService } from '@/services/pdfService'
import { SourceSelector } from '@/components/faq/source-selector';
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { faqService } from '@/services/faqService';


export default function SmartFAQ() {
    const params = useParams()
    const { id } = params
    const router = useRouter();

    const [faq, setFaq] = useState<Partial<FAQ> | null>(null);
    const [messages, setMessages] = useState<QuestionAnswer[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);
    const [tone, setTone] = useState("neutral");
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const { socket, isConnected, sendMessage, websocketError } = useWebSocket();

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
                setInputText(data.content)
                setMessages(data.generated_faqs || [])
                setTone(data.tone || "neutral")
                setNumQuestions(data.number_of_faqs || 5)
            } catch (error) {
                if (error instanceof AppError) {
                    setError(error.message)
                    toast.error(error.message)
                } else {
                    toast.error('Failed to fetch FAQ')
                }
            } finally {
                setIsLoading(false)
            }
        }
        if (id && id !== 'new') {
            fetchFaq()
        }
        if (!socket) return;

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as WebSocketMessage;

                switch (data.type) {
                    case 'faq':
                        if (data.question && data.answer && data.id) {
                            setMessages(prev => {
                                return [...prev,
                                {
                                    id: parseInt(data.id!),
                                    question: data.question || "",
                                    answer: data.answer || ""
                                }]

                            });
                        }
                        break;

                    case 'status':
                        if (data.status === 'complete' && data.faq) {
                            setFaq(data.faq);
                            setIsLoading(false);
                            // Update URL if it's a new FAQ
                            if (id === 'new' && data.faq.id) {
                                router.replace(`/faq/${data.faq.id}`);
                            }
                        }
                        if (data.status === 'complete' || data.status === 'stopped') {
                            setIsGenerating(false);
                            setIsLoading(false);
                        }
                        break;

                    case 'error':
                        setError(data.message || 'An error occurred');
                        setIsLoading(false);
                        setIsGenerating(false);
                        toast.error(data.message);
                        break;
                }
            } catch (error) {
                console.error('Failed to parse message:', error);
                toast.error('Failed to process server response');
            }
        };
    }, [socket, id, router]);

    const handleGenerate = useCallback(() => {
        if (!inputText.trim()) {
            toast.error('Please enter some text');
            return;
        }

        if (!isConnected) {
            toast.error('Not connected to server');
            return;
        }

        setError(null);
        setIsGenerating(true);
        setIsLoading(true);
        setFaq(null);
        setMessages([]);

        const success = sendMessage({
            type: 'generate',
            text: inputText,
            num_questions: numQuestions,
            tone: tone,
            faq_id: id === 'new' ? undefined : id
        });

        if (!success) {
            setIsGenerating(false);
            setIsLoading(false);
            toast.error('Failed to send message');
        }
    }, [inputText, numQuestions, tone, isConnected, sendMessage, id]); // Add id to dependencies

    const handleStop = useCallback(() => {
        if (!socket || !isConnected) return;

        sendMessage({
            type: 'stop'
        });
        setIsGenerating(false);
        toast.info('Generation stopped');
    }, [socket, isConnected, sendMessage]);

    const handleScrape = async (url: string) => {
        try {
            setIsLoading(true);
            const { content } = await scrapeService.scrape(url);
            setInputText(content);
            toast.success('Content summarized successfully');
        } catch (error) {
            if (error instanceof AppError) {
                toast.error(error?.details?.error || error.message);
            } else {
                toast.error('Failed to scrape URL');
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleFileUpload = async (file: File) => {
        try {
            setIsLoading(true)
            const { content } = await pdfService.upload(file)
            setInputText(content)
            toast.success('PDF content extracted successfully')
        } catch (error) {
            if (error instanceof AppError) {
                toast.error(error?.details?.error || error.message)
            } else {
                toast.error('Failed to process PDF')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!faq?.id) return;

        try {
            await faqService.downloadPDF(faq.id);
        } catch (error) {
            if (error instanceof AppError) {
                toast.error(error.message);
            } else {
                toast.error('Failed to download PDF');
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                    FAQ Generation {faq?.title && `- ${faq.title}`}
                </h1>
                {faq?.id && (
                    <Button onClick={handleDownload} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
                    <p>{error}</p>
                </div>
            )}

            <h2>
                {isConnected ? <span className="text-green-500">Connected</span> : <span className="text-red-500">Disconnected</span>}
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                    <SourceSelector
                        onScrape={handleScrape}
                        onUpload={handleFileUpload}
                        disabled={isLoading}
                    />
                    <FAQInput
                        content={inputText}
                        onChange={setInputText}
                        disabled={isLoading}
                    />
                </div>
                <FAQOptions
                    numQuestions={numQuestions}
                    tone={tone}
                    disabled={isLoading}
                    update={id !== 'new'}
                    onQuestionsChange={setNumQuestions}
                    onToneChange={setTone}
                    onGenerate={handleGenerate}
                    onStop={handleStop}
                    isGenerating={isGenerating}
                />
                <GeneratedFAQs
                    faqs={messages}
                    isLoading={isGenerating}
                />
            </div>
        </div>
    );
}
