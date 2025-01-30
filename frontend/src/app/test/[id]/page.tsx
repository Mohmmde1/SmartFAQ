'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

import { toast } from 'sonner';
import { GeneratedFAQs } from '@/components/faq/generated-faqs';
import { FAQ, QuestionAnswer } from '@/types/api';
import { WebSocketMessage } from '@/types/websocket';
import { FAQInput } from '@/components/faq/faq-input';
import { FAQOptions } from '@/components/faq/faq-options';
import { useParams } from 'next/navigation';
import { AppError } from '@/lib/errors';


export default function SmartFAQ() {
    const params = useParams()
    const { id } = params

    const [faq, setFaq] = useState<Partial<FAQ> | null>(null);
    const [messages, setMessages] = useState<QuestionAnswer[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);
    const [tone, setTone] = useState("neutral");
    const [error, setError] = useState<string | null>(null);

    const { socket, isConnected, sendMessage } = useWebSocket();

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
        if (id) {
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
                        }
                        break;

                    case 'error':
                        setError(data.message || 'An error occurred');
                        setIsLoading(false);
                        toast.error(data.message);
                        break;
                }
            } catch (error) {
                console.error('Failed to parse message:', error);
                toast.error('Failed to process server response');
            }
        };
    }, [socket]);

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
        setIsLoading(true);
        setFaq(null);
        setMessages([]);

        const success = sendMessage({
            type: 'generate',
            text: inputText,
            num_questions: numQuestions,
            tone: tone,
            faq_id: id
        });

        if (!success) {
            setIsLoading(false);
            toast.error('Failed to send message');
        }
    }, [inputText, numQuestions, tone, isConnected, sendMessage]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">
                FAQ Generation {faq?.title && `- ${faq.title}`}
            </h1>
            <h2>
                {isConnected ? <span className="text-green-500">Connected</span> : <span className="text-red-500">Disconnected</span>}
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
                <FAQInput
                    content={inputText}
                    onChange={setInputText}
                    disabled={isLoading}
                />
                <FAQOptions
                    numQuestions={numQuestions}
                    tone={tone}
                    disabled={isLoading}
                    onQuestionsChange={setNumQuestions}
                    onToneChange={setTone}
                    onGenerate={handleGenerate}
                />
                <GeneratedFAQs
                    faqs={messages}
                />
            </div>
        </div>
    );
}
