import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PWABadge } from 'components/pwa-badge.tsx'
import { Toaster } from 'components/ui/sonner'
import { TooltipProvider } from 'components/ui/tooltip'
import { type ReactNode } from 'react'

const queryClient = new QueryClient()

type Properties = {
  children: ReactNode
}

export function Layout({ children }: Properties) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        className="sr-only hover:underline focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:bg-foreground focus-visible:px-4 focus-visible:py-3 focus-visible:text-background"
        href="#content"
      >
        Skip to main content
      </a>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <main id="content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
        </TooltipProvider>
      </QueryClientProvider>
      <Toaster />
      <PWABadge />
    </div>
  )
}
