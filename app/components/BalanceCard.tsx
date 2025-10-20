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
    <div className="w-full rounded-xl border border-gray-800 bg-gray-900/90 shadow-xl">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-200">Current Balance</h2>
        </div>
        <div className="mt-4 flex flex-col items-center text-center">
          <div className="text-4xl sm:text-5xl font-extrabold text-teal-400 mb-2 animate-fade-in">
            {formatCurrency(balance, currency)}
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${isPositive ? 'text-teal-400' : 'text-red-400'}`} />
            <span className={`text-sm font-semibold ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{Number(changePercent).toFixed(2)}%
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