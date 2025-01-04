'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAuthPage = pathname === '/auth'

    return (
        <div className="flex flex-col min-h-screen">
            {!isAuthPage && <Header />}
            <main className="flex-grow">{children}</main>
            {!isAuthPage && <Footer />}
        </div>
    )
}
