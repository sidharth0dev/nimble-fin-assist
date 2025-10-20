'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  CreditCard, 
  Target, 
  BarChart3, 
  Menu,
  User
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: CreditCard,
  },
  {
    name: 'Budgets',
    href: '/budgets',
    icon: Target,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
]

interface AppSidebarProps {
  className?: string
}

export default function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex h-full w-64 flex-col bg-gray-900 border-r border-gray-800",
      className
    )}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-3 px-6 py-4 border-b border-gray-800"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Menu className="h-6 w-6 text-white" />
        </motion.div>
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl font-bold text-blue-400"
          >
            FinanceFlow
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-gray-400"
          >
            Budget Assistant
          </motion.p>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-gray-800 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  {item.name}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* User Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="p-4 border-t border-gray-800"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center"
          >
            <User className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <p className="text-sm font-medium text-white">User</p>
            <p className="text-xs text-gray-400">user@example.com</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}