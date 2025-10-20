'use client'

import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { format } from 'date-fns'
import { useCurrency } from '@/hooks/useCurrency'
import { formatCurrency } from '@/lib/currency'

interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  date: Date
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { currency } = useCurrency()

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No recent transactions</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const isIncome = transaction.type === 'INCOME'
        const iconColor = isIncome ? 'bg-green-600' : 'bg-orange-600'
        const amountColor = isIncome ? 'text-green-500' : 'text-red-500'
        const amountPrefix = isIncome ? '+' : '-'

        return (
          <div
            key={transaction.id}
            className="p-4 bg-gray-800 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-10 w-10 rounded-full ${iconColor} flex items-center justify-center`}>
                  {isIncome ? (
                    <ArrowDownLeft className="h-5 w-5 text-white" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-white truncate">{transaction.description}</h3>
                  <p className="text-sm text-gray-400">
                    <span className="mr-2">{transaction.category}</span>
                    <span className="text-gray-500">•</span>
                    <span className="ml-2">{format(transaction.date, 'MMM d, yyyy')}</span>
                  </p>
                </div>
              </div>
              <div className={`font-semibold ${amountColor} shrink-0 text-right`}>
                {amountPrefix}{formatCurrency(Math.abs(transaction.amount), currency)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}