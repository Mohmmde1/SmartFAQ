import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-muted py-6 px-4 md:px-6 lg:px-8">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} AI FAQ Generator. All rights reserved.
                    </p>
                </div>
                <nav className="flex gap-4">
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                        Terms of Service
                    </Link>
                    <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                        Contact Us
                    </Link>
                </nav>
            </div>
        </footer>
    )
}
