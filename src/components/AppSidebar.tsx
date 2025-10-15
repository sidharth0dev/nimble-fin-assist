'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <Menu className="h-6 w-6 text-white" />
        <div>
          <h1 className="text-xl font-bold text-blue-400">FinanceFlow</h1>
          <p className="text-sm text-gray-400">Budget Assistant</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">User</p>
            <p className="text-xs text-gray-400">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}