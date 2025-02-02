import { useState } from "react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { URLInput } from "./url-input"
import { FileUpload } from "./file-upload"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Upload, Link } from "lucide-react"

interface SourceSelectorProps {
    onScrape: (url: string) => Promise<void>
    onUpload: (file: File) => Promise<void>
    disabled?: boolean
}

export function SourceSelector({ onScrape, onUpload, disabled }: SourceSelectorProps) {
    return (
        <Card className="p-4">
            <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="url">
                        <Link className="w-4 h-4 mr-2" />
                        Extract from URL
                    </TabsTrigger>
                    <TabsTrigger value="pdf">
                        <Upload className="w-4 h-4 mr-2" />
                        Extract from PDF
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="url">
                    <URLInput onScrape={onScrape} disabled={disabled} />
                </TabsContent>
                <TabsContent value="pdf">
                    <FileUpload onUpload={onUpload} disabled={disabled} />
                </TabsContent>
            </Tabs>
        </Card>
    )
}
