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
    <div className="w-full h-full min-h-[280px] rounded-xl border border-gray-800 bg-gray-900/90 shadow-xl flex flex-col">
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-200">Current Balance</h2>
        </div>
        <div className="flex flex-col items-center text-center flex-1 justify-center">
          <div className="text-5xl sm:text-6xl font-extrabold text-teal-400 mb-4 animate-fade-in animate-subtle-pulse">
            {formatCurrency(balance, currency)}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`h-5 w-5 ${isPositive ? 'text-teal-400' : 'text-red-400'}`} />
            <span className={`text-base font-semibold ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{Number(changePercent).toFixed(2)}%
            </span>
          </div>
          <p className="text-sm text-gray-400">
            {isPositive ? '+' : ''}{formatCurrency(change, currency)} from last month
          </p>
        </div>
      </div>
    </div>
  )
}