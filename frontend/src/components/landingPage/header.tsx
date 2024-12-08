import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Header() {
    return (
        <header className="py-6 px-4 md:px-6 lg:px-8 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
                AI FAQ Generator
            </Link>
            <nav>
                <Button variant="ghost">Login</Button>
                <Button>Sign Up</Button>
            </nav>
        </header>
    )
}
