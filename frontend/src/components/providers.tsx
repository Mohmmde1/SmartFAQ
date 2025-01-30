'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { useState } from 'react'

export default function Providers({
    children,
    ...themeProps
}: {
    children: React.ReactNode
    [key: string]: any
}) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,
                retry: 2,
                refetchOnWindowFocus: false,
            },
        },
    }))

    return (
        <ThemeProvider {...themeProps}>
            <SessionProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </SessionProvider>
        </ThemeProvider>
    )
}
