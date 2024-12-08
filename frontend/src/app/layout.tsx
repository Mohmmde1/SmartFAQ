import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/landingPage/header'
import Footer from '@/components/landingPage/footer'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartFAQ - AI-Powered FAQ Generator',
  description: 'Generate FAQs from your documents using AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
