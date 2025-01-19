import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Slider } from "../ui/slider"
import { Textarea } from "../ui/textarea"

interface FAQGeneratorProps {
    inputText: string
    setInputText: (value: string) => void
    numQuestions: number
    setNumQuestions: (value: number) => void
    tone: string
    setTone: (value: string) => void
    isLoading: boolean
    onGenerate: () => Promise<void>
}

export function FAQGenerator({
    inputText,
    setInputText,
    numQuestions,
    setNumQuestions,
    tone,
    setTone,
    isLoading,
    onGenerate
}: FAQGeneratorProps) {
    return (
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

                    <Button onClick={onGenerate} disabled={isLoading} className="w-full">
                        {isLoading ? 'Generating FAQs' : 'Generate FAQs'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
