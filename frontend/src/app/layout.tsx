import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import LayoutWrapper from '@/components/layout-wrapper'
import { ThemeProvider } from '@/components/theme-provider'
import '@/app/globals.css'
import { Session } from 'inspector/promises'
import SessionProviderWrapper from '@/components/session-provider-wrapper'
import { Toaster } from 'sonner'

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProviderWrapper>
            <LayoutWrapper>{children}</LayoutWrapper>
          </SessionProviderWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
