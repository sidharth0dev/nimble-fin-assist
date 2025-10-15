'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import BalanceCard from '@/components/BalanceCard'
import SpendingChart from '@/components/SpendingChart'
import RecentTransactions from '@/components/RecentTransactions'
import AddTransactionModal from '@/components/AddTransactionModal'

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
]

const mockSpendingData = [
  { category: 'Food', amount: 450 },
  { category: 'Shopping', amount: 320 },
  { category: 'Transport', amount: 180 },
  { category: 'Entertainment', amount: 220 },
  { category: 'Bills', amount: 670 },
]

export default function DashboardPage() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [spendingData, setSpendingData] = useState(mockSpendingData)

  // Calculate current balance
  const currentBalance = transactions.reduce((sum, transaction) => {
    return sum + transaction.amount
  }, 8450) // Starting balance

  // Calculate change from last month (mock data)
  const lastMonthBalance = 8030
  const balanceChange = currentBalance - lastMonthBalance
  const balanceChangePercent = ((balanceChange / lastMonthBalance) * 100).toFixed(1)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's your financial overview.</p>
          </div>
          <AddTransactionModal />
        </div>

        {/* Current Balance Card */}
        <BalanceCard 
          balance={currentBalance}
          change={balanceChange}
          changePercent={parseFloat(balanceChangePercent)}
        />

        {/* Monthly Spending Chart */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Monthly Spending by Category</h2>
          <SpendingChart data={spendingData} />
        </div>

        {/* Recent Transactions */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
          <RecentTransactions transactions={transactions.slice(0, 5)} />
        </div>
      </div>
    </DashboardLayout>
  )
}
