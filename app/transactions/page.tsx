'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Input } from '@/components/ui/input'
import { Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import AddTransactionModal from '@/components/AddTransactionModal'
import { format } from 'date-fns'

// Mock data - in a real app, this would come from your API
const mockTransactions = [
  {
    id: '1',
    amount: -85.50,
    description: 'Grocery Store',
    category: 'Food & Dining',
    type: 'EXPENSE' as const,
    date: new Date('2025-10-14'),
  },
  {
    id: '2',
    amount: 3500.00,
    description: 'Salary Deposit',
    category: 'Income',
    type: 'INCOME' as const,
    date: new Date('2025-10-13'),
  },
  {
    id: '3',
    amount: -120.00,
    description: 'Electric Bill',
    category: 'Bills & Utilities',
    type: 'EXPENSE' as const,
    date: new Date('2025-10-12'),
  },
  {
    id: '4',
    amount: -12.50,
    description: 'Coffee Shop',
    category: 'Food & Dining',
    type: 'EXPENSE' as const,
    date: new Date('2025-10-11'),
  },
  {
    id: '5',
    amount: -45.00,
    description: 'Gas Station',
    category: 'Transportation',
    type: 'EXPENSE' as const,
    date: new Date('2025-10-10'),
  },
  {
    id: '6',
    amount: -89.99,
    description: 'Online Shopping',
    category: 'Shopping',
    type: 'EXPENSE' as const,
    date: new Date('2025-10-09'),
  },
  {
    id: '7',
    amount: -28.00,
    description: 'Movie Tickets',
    category: 'Entertainment',
    type: 'EXPENSE' as const,
    date: new Date('2025-10-08'),
  },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
            <p className="text-gray-400">View and manage all your transactions.</p>
          </div>
          <AddTransactionModal />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
          />
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const isIncome = transaction.type === 'INCOME'
            const iconColor = isIncome ? 'bg-green-600' : 'bg-orange-600'
            const amountColor = isIncome ? 'text-green-500' : 'text-red-500'
            const amountPrefix = isIncome ? '+' : '-'

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-800"
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

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No transactions found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
