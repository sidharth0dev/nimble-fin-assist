'use client'

import { TrendingUp } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { formatCurrency } from '@/lib/currency'

interface BalanceCardProps {
  balance: number
  change: number
  changePercent: number
}

export default function BalanceCard({ balance, change, changePercent }: BalanceCardProps) {
  const { currency } = useCurrency()

  const isPositive = change >= 0

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 w-full">
      <h2 className="text-lg font-medium text-gray-300 mb-4">Current Balance</h2>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-white mb-2">
            {formatCurrency(balance, currency)}
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{changePercent}%
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {isPositive ? '+' : ''}{formatCurrency(change, currency)} from last month
          </p>
        </div>
      </div>
    </div>
  )
}