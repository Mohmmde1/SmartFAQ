import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface URLInputProps {
    onScrape: (url: string) => Promise<void>
    disabled?: boolean
}

export function URLInput({ onScrape, disabled }: URLInputProps) {
    const [url, setUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleScrape = async () => {
        try {
            setIsLoading(true)
            await onScrape(url)
            setUrl("")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            <Input
                type="url"
                placeholder="Enter website URL to scrape..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={disabled || isLoading}
            />
            <Button
                onClick={handleScrape}
                disabled={!url || disabled || isLoading}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Extract Summary"}
            </Button>
        </div>
    )
}
