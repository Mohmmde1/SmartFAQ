import { QuestionAnswer } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function GeneratedFAQs({ faqs }: { faqs: QuestionAnswer[] }) {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Generated FAQs</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {faqs.map((qa) => (
                        <div key={qa.id} className="border p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">{qa.question}</h3>
                            <p className="text-muted-foreground">{qa.answer}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
