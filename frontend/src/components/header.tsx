'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from './theme-toggle'

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { data: session } = useSession()

    return (
        <header className="py-4 px-4 md:px-6 lg:px-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">SmartFAQ</span>
                </Link>
                <nav className="hidden md:flex space-x-4 items-center">
                    {session ? (
                        <>
                            <Link href="/faqs" className="text-sm font-medium hover:text-primary">
                                My FAQs
                            </Link>
                            <span className="text-sm font-medium">Welcome, {session.user?.email}</span>
                            <Button onClick={() => signOut()} variant="ghost">Sign Out</Button>
                        </>
                    ) : (
                        <>
                            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary">
                                How It Works
                            </Link>
                            <Link href="#features" className="text-sm font-medium hover:text-primary">
                                Features
                            </Link>
                            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
                                Pricing
                            </Link>
                            <Button asChild>
                                <Link href="/auth">Sign In</Link>
                            </Button>
                        </>
                    )}
                    <ThemeToggle />
                </nav>
                <div className="md:hidden flex items-center space-x-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-expanded={isMobileMenuOpen}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                    {isMobileMenuOpen && (
                        <nav className="absolute top-full left-0 right-0 bg-background border-b border-border/40 py-4 md:hidden">
                            <div className="flex flex-col space-y-4 items-center">
                                {session ? (
                                    <>
                                        <Link href="/faqs" className="text-sm font-medium hover:text-primary">
                                            My FAQs
                                        </Link>
                                        <span className="text-sm font-medium">Welcome, {session.user?.name}</span>
                                        <Button onClick={() => signOut()} variant="ghost" className="w-full">Sign Out</Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="#how-it-works" className="text-sm font-medium hover:text-primary">
                                            How It Works
                                        </Link>
                                        <Link href="#features" className="text-sm font-medium hover:text-primary">
                                            Features
                                        </Link>
                                        <Link href="#pricing" className="text-sm font-medium hover:text-primary">
                                            Pricing
                                        </Link>
                                        <Button asChild className="w-full">
                                            <Link href="/auth">Sign In</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    )
}
