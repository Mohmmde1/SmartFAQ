import { Upload, File, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FileUploadProps {
    onUpload: (file: File) => Promise<void>
    disabled?: boolean
}

export function FileUpload({ onUpload, disabled }: FileUploadProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleFile = async (file: File) => {
        if (!file.name.endsWith('.pdf')) {
            toast.error('Please upload a PDF file')
            return
        }
        setSelectedFile(file)
        setIsLoading(true)
        try {
            await onUpload(file)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        const file = e.dataTransfer?.files?.[0]
        if (file) await handleFile(file)
    }

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) await handleFile(file)
    }

    const clearFile = () => {
        setSelectedFile(null)
    }

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-lg border-2 border-dashed transition-colors",
                dragActive ? "border-primary" : "border-muted-foreground/25",
                disabled && "opacity-50 cursor-not-allowed"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <Input
                type="file"
                accept=".pdf"
                onChange={handleChange}
                disabled={disabled || isLoading}
                className="hidden"
                id="pdf-upload"
            />

            {selectedFile ? (
                <div className="flex items-center gap-2 p-4">
                    <File className="h-8 w-8 text-blue-500" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearFile}
                        className="ml-2"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <label
                    htmlFor="pdf-upload"
                    className="flex flex-col items-center justify-center gap-2 p-4 cursor-pointer"
                >
                    <Upload className={cn(
                        "h-10 w-10 transition-colors",
                        dragActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="text-center">
                        <p className="text-sm font-medium">
                            Drag & drop your PDF here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            PDF up to 10MB
                        </p>
                    </div>
                </label>
            )}

            {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            )}
        </div>
    )
}
