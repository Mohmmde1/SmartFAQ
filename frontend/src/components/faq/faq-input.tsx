import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";

interface FAQInputProps {
    content: string;
    onChange: (value: string) => void;
}

export function FAQInput({ content, onChange }: FAQInputProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Input Text</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-h-[200px]"
                />
            </CardContent>
        </Card>
    )
}
