'use client'

import AppSidebar from './AppSidebar'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Static sidebar for large screens */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden lg:block"
      >
        <AppSidebar />
      </motion.div>

      {/* Mobile slide-over sidebar */}
      <div className={isMobileSidebarOpen ? 'fixed inset-0 z-40 flex lg:hidden' : 'hidden'}>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
        {/* Panel */}
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ duration: 0.25 }}
          className="relative z-50"
        >
          <div className="absolute right--12 top-4">
            <button
              aria-label="Close sidebar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-900 text-white shadow ring-1 ring-white/10"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <AppSidebar />
        </motion.div>
      </div>

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 overflow-auto"
      >
        {/* Top bar for mobile with hamburger */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-800 bg-gray-950/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            aria-label="Open sidebar"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-200 ring-1 ring-white/10"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="text-white font-semibold">FinanceFlow</div>
          <div className="w-6" />
        </div>

        <div className="p-4 sm:p-6">
          {children}
        </div>
      </motion.main>
    </div>
  )
}