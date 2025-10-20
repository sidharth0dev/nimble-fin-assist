import { TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/currency'

interface BalanceCardServerProps {
  userId: string
}

export default async function BalanceCardServer({ userId }: BalanceCardServerProps) {
  // Directly fetch user data from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      balance: true,
      currency: true,
    },
  })

  if (!user) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="text-center py-8">
          <p className="text-gray-400">User not found</p>
        </div>
      </div>
    )
  }

  // Calculate change from last month (mock data for now)
  const lastMonthBalance = user.balance * 0.95 // Simulate 5% change
  const balanceChange = user.balance - lastMonthBalance
  const balanceChangePercent = lastMonthBalance > 0 ? ((balanceChange / lastMonthBalance) * 100) : 0

  const isPositive = balanceChange >= 0

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h2 className="text-lg font-medium text-gray-300 mb-4">Current Balance</h2>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-white mb-2">
            {formatCurrency(user.balance, user.currency)}
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{balanceChangePercent.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {isPositive ? '+' : ''}{formatCurrency(balanceChange, user.currency)} from last month
          </p>
        </div>
      </div>
    </div>
  )
}
