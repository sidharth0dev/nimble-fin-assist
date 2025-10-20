'use client'

import { motion } from 'framer-motion'
import BalanceCard from './BalanceCard'
import SpendingChart from './SpendingChart'
import RecentTransactions from './RecentTransactions'
import AddTransactionModal from './AddTransactionModal'
import RecurringTransactionModal from './RecurringTransactionModal'
import { addTransactionAction } from '@/actions/transactions'

interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  date: Date
}

interface User {
  id: string
  name: string
  email: string
  balance: number
  currency: string
}

interface RecurringTransaction {
  id: string
  amount: number
  description: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  frequency: 'WEEKLY' | 'MONTHLY'
  startDate: string
  endDate?: string
  isActive: boolean
}

interface AnimatedDashboardProps {
  user: User | null
  transactions: Transaction[]
  recurringTransactions: RecurringTransaction[]
  spendingData: { category: string; amount: number }[]
  balanceChange: number
  balanceChangePercent: number
}

export default function AnimatedDashboard({
  user,
  transactions,
  recurringTransactions,
  spendingData,
  balanceChange,
  balanceChangePercent
}: AnimatedDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your financial overview.</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-2"
        >
          <RecurringTransactionModal 
            recurringTransactions={recurringTransactions}
          />
          <AddTransactionModal action={addTransactionAction} />
        </motion.div>
      </motion.div>

      {/* Current Balance Card */}
      {!user ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-900 rounded-lg p-6 border border-gray-800"
        >
          <div className="text-center py-8">
            <p className="text-gray-400">User not found. Please check your authentication.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <BalanceCard 
            balance={user.balance}
            change={balanceChange}
            changePercent={balanceChangePercent}
          />
        </motion.div>
      )}

      {/* Balance Forecast temporarily disabled in client to avoid server-only imports */}

      {/* Monthly Spending Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors duration-300"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Monthly Spending by Category</h2>
        <SpendingChart data={spendingData} />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors duration-300"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
        <RecentTransactions transactions={transactions.slice(0, 5)} />
      </motion.div>
    </div>
  )
}


