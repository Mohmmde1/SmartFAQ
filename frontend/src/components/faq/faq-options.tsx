import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";

type FAQOptionsProps = {
    numQuestions: number;
    tone: string;
    disabled?: boolean;
    onQuestionsChange: (value: number) => void;
    onToneChange: (value: string) => void;
    onGenerate: () => void;
}

export function FAQOptions({ numQuestions, tone, disabled = false, onQuestionsChange, onToneChange, onGenerate }: FAQOptionsProps) {
    return (
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
                        onValueChange={(value) => onQuestionsChange(value[0])}
                        disabled={disabled}
                    />
                    <div className="text-sm text-muted-foreground">{numQuestions} questions</div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tone">Tone</Label>
                    <Select disabled={disabled} value={tone} onValueChange={onToneChange}>
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
                <Button onClick={onGenerate} disabled={disabled} className="w-full">
                    Update FAQs
                </Button>
            </CardContent>
        </Card>
    )
}
