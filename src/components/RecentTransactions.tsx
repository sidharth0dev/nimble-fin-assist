'use client'

import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { format } from 'date-fns'

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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount))
  }

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
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full ${iconColor} flex items-center justify-center`}>
                {isIncome ? (
                  <ArrowDownLeft className="h-5 w-5 text-white" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-white">{transaction.description}</h3>
                <p className="text-sm text-gray-400">
                  {transaction.category} • {format(transaction.date, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className={`font-semibold ${amountColor}`}>
              {amountPrefix}{formatCurrency(transaction.amount)}
            </div>
          </div>
        )
      })}
    </div>
  )
}