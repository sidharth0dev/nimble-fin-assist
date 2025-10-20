"use client"

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import BalanceCard from '@/components/BalanceCard'
import SpendingChart from '@/components/SpendingChart'
import RecentTransactions from '@/components/RecentTransactions'
import AddTransactionModal from '@/components/AddTransactionModal'
import ForecastCard from '@/components/ForecastCard'
import RecurringTransactionModal from '@/components/RecurringTransactionModal'
import { addTransactionAction } from '@/actions/transactions'
import AnimatedDashboard from '@/components/AnimatedDashboard'

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

// Client-side data fetching function
async function fetchDashboardData(): Promise<{ user: User | null; transactions: Transaction[]; recurringTransactions: RecurringTransaction[] }> {
  try {
    console.log('🔍 DASHBOARD: Starting client-side data fetch...')
    
    // Use test user ID for now (you can modify this to use authentication later)
    const userId = 'user-1'
    
    // Fetch user balance from API
    const balanceResponse = await fetch(`/api/user/balance?userId=${userId}`)
    if (!balanceResponse.ok) {
      throw new Error('Failed to fetch user balance')
    }
    const balanceData = await balanceResponse.json()
    
    // Fetch transactions from API
    const transactionsResponse = await fetch('/api/transactions', {
      headers: {
        'Authorization': 'Bearer user-1' // Simple auth for development
      }
    })
    if (!transactionsResponse.ok) {
      throw new Error('Failed to fetch transactions')
    }
    const transactionsData = await transactionsResponse.json()
    
    // Fetch recurring transactions from API
    const recurringResponse = await fetch('/api/recurring-transactions', {
      headers: {
        'Authorization': 'Bearer user-1' // Simple auth for development
      }
    })
    if (!recurringResponse.ok) {
      throw new Error('Failed to fetch recurring transactions')
    }
    const recurringData = await recurringResponse.json()
    
    // Process user data
    const user: User = {
      id: balanceData.userId,
      name: 'User', // Default name since API doesn't return it
      email: 'user@example.com', // Default email since API doesn't return it
      balance: balanceData.balance,
      currency: balanceData.currency
    }
    
    // Process transactions data
    const transactions: Transaction[] = transactionsData.transactions.map((t: any) => ({
      ...t,
      amount: Number(t.amount),
      date: new Date(t.date)
    }))
    
    // Process recurring transactions data
    const recurringTransactions: RecurringTransaction[] = recurringData.recurringTransactions.map((rt: any) => ({
      ...rt,
      amount: Number(rt.amount),
      startDate: rt.startDate,
      endDate: rt.endDate
    }))
    
    console.log('✅ DASHBOARD: Client-side data fetch completed:', {
      userBalance: user.balance,
      transactionsCount: transactions.length,
      recurringTransactionsCount: recurringTransactions.length
    })
    
    return { user, transactions, recurringTransactions }
  } catch (error) {
    console.error('❌ DASHBOARD: Error fetching data from API:', error)
    return { user: null, transactions: [], recurringTransactions: [] }
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchDashboardData()
        setUser(data.user)
        setTransactions(data.transactions)
        setRecurringTransactions(data.recurringTransactions)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])
  
  // Calculate spending data by category
  const spendingData = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, transaction) => {
      const existing = acc.find(item => item.category === transaction.category)
      if (existing) {
        existing.amount += Math.abs(transaction.amount)
      } else {
        acc.push({ category: transaction.category, amount: Math.abs(transaction.amount) })
      }
      return acc
    }, [] as { category: string; amount: number }[])

  // Calculate change from last month (mock data for now)
  const lastMonthBalance = user ? user.balance * 0.95 : 0 // Simulate 5% change
  const balanceChange = user ? user.balance - lastMonthBalance : 0
  const balanceChangePercent = lastMonthBalance > 0 ? ((balanceChange / lastMonthBalance) * 100) : 0

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <AnimatedDashboard
        user={user}
        transactions={transactions}
        recurringTransactions={recurringTransactions}
        spendingData={spendingData}
        balanceChange={balanceChange}
        balanceChangePercent={balanceChangePercent}
      />
    </DashboardLayout>
  )
}