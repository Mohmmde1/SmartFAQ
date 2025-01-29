import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";

type FAQInputProps = {
    content: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function FAQInput({ content, onChange, disabled = false }: FAQInputProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Input Text</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    disabled={disabled}
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-h-[200px]"
                />
            </CardContent>
        </Card>
    )
}
