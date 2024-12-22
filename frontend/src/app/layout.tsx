import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import LayoutWrapper from '@/components/layout-wrapper'
import SessionProviderWrapper from '@/components/session-provider-wrapper'
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
        <SessionProviderWrapper>
          <LayoutWrapper>{children}</LayoutWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
