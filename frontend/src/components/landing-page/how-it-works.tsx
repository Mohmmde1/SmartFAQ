import { FileUp, Brain, Download } from 'lucide-react'

export default function HowItWorks() {
    const steps = [
        {
            icon: <FileUp className="h-12 w-12 mb-4" />,
            title: "Upload your document",
            description: "PDF, Word, or scanned images"
        },
        {
            icon: <Brain className="h-12 w-12 mb-4" />,
            title: "AI analyzes content",
            description: "Our AI generates FAQs"
        },
        {
            icon: <Download className="h-12 w-12 mb-4" />,
            title: "Download results",
            description: "Get your FAQs instantly"
        }
    ]

    return (
        <section className="py-12 md:py-24 bg-muted">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            {step.icon}
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
