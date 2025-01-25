import { QuestionAnswer } from "@/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"



export function GeneratedFAQs({ faqs }: { faqs: QuestionAnswer[] }) {


    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Generated FAQs</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[500px]">
                    <div className="space-y-4 p-4">
                        {faqs.length === 0 ? (
                            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                                No FAQs generated yet
                            </div>
                        ) : (
                            faqs.map((qa) => (
                                <div
                                    key={qa.id}
                                    className="border border-border/50 p-6 rounded-lg
                                             hover:bg-accent/50 transition-colors
                                             shadow-sm hover:shadow-md"
                                >
                                    <h3 className="font-semibold mb-3 text-l">
                                        {qa.question}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {qa.answer}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
