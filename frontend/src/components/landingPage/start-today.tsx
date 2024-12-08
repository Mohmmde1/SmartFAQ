'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function StartToday() {
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0])
        }
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        // Here you would handle the file upload and processing
        console.log('File to upload:', file)
    }

    return (
        <section className="py-12 md:py-24 bg-muted">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Today</h2>
                <p className="text-xl mb-8">Upload your file and let us do the rest!</p>
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                    <div className="mb-4">
                        <Label htmlFor="file-upload" className="block text-left mb-2">
                            Choose a file
                        </Label>
                        <Input
                            id="file-upload"
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={!file}>
                        Generate FAQs
                    </Button>
                </form>
            </div>
        </section>
    )
}
