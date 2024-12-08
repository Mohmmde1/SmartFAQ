import { CheckCircle } from 'lucide-react'

export default function WhyChooseUs() {
    const reasons = [
        "Streamline your workflow by turning complex documents into simple Q&A formats",
        "Free, fast, and easy to use for everyone"
    ]

    return (
        <section className="py-12 md:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Us</h2>
                <ul className="space-y-4 max-w-2xl mx-auto">
                    {reasons.map((reason, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-primary mr-2 flex-shrink-0" />
                            <span>{reason}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
