'use client'

import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'
import BalanceCard from './BalanceCard'
import SpendingChart from './SpendingChart'
import RecentTransactions from './RecentTransactions'
import AddTransactionModal from './AddTransactionModal'
import RecurringTransactionModal from './RecurringTransactionModal'
import FinancialVisualizer, { StaticFinancialVisualizer } from './FinancialVisualizer'
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
  const isMobile = useIsMobile()
  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your financial overview.</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-2 w-full sm:w-auto justify-end"
        >
          <div className="flex gap-2">
            <RecurringTransactionModal 
              recurringTransactions={recurringTransactions}
            />
            <div className="[&>button]:px-4">
              <AddTransactionModal action={addTransactionAction} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Grid - Prioritizing key components */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Current Balance Card - Prominent position */}
        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 w-full lg:col-span-4"
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
            className="w-full lg:col-span-4"
          >
            <BalanceCard 
              balance={user.balance}
              change={balanceChange}
              changePercent={balanceChangePercent}
            />
          </motion.div>
        )}

        {/* Monthly Spending Chart - Large and prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors duration-300 w-full lg:col-span-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Monthly Spending by Category</h2>
          <SpendingChart data={spendingData} />
        </motion.div>

        {/* Recent Transactions - Full width for better visibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors duration-300 w-full lg:col-span-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
          <RecentTransactions transactions={transactions.slice(0, 8)} />
        </motion.div>
      </div>

      {/* Secondary Visualizers - Smaller and less prominent */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 mt-6">
        {/* Financial Flow Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-gray-700/50 transition-colors duration-300 w-full h-48"
        >
          <div className="p-4 h-full">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Financial Flow</h3>
            <div className="h-full">
              {isMobile ? (
                <StaticFinancialVisualizer variant="flowing-lines" className="h-full" />
              ) : (
                <FinancialVisualizer variant="flowing-lines" className="h-full" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Growth Particles Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-gray-700/50 transition-colors duration-300 w-full h-48"
        >
          <div className="p-4 h-full">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Growth Indicators</h3>
            <div className="h-full">
              {isMobile ? (
                <StaticFinancialVisualizer variant="particles" className="h-full" />
              ) : (
                <FinancialVisualizer variant="particles" className="h-full" />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


