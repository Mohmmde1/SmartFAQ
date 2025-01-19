import { FAQ } from "@/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { Button } from "../ui/button"
import Link from "next/link"

interface FAQListProps {
    faqs: FAQ[]
    isFetchingFaqs: boolean
    hasMore: boolean
    scrollRef: any
}

export function FAQList({ faqs, isFetchingFaqs, hasMore, scrollRef }: FAQListProps) {
    return (
        <Card className="w-full h-[600px] flex flex-col">
            <CardHeader>
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
                            {hasMore && (
                                <div ref={scrollRef} className="py-4 text-center">
                                    {isFetchingFaqs ? 'Loading more...' : 'Scroll for more'}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
