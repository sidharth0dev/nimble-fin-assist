import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinanceFlow - Budget Assistant',
  description: 'A modern budgeting application to track your finances',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-950 text-gray-100 antialiased transition-all duration-300">
            {children}
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </body>
    </html>
  )
}


