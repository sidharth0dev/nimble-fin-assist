import { prisma } from '@/lib/prisma'
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

// Server-side data fetching function with diagnostic logging
async function getDashboardData(): Promise<{ user: User | null; transactions: Transaction[]; recurringTransactions: RecurringTransaction[] }> {
  try {
    console.log('🔍 DASHBOARD: Starting data fetch from database...')
    
    // Use test user ID for now (you can modify this to use authentication later)
    const userId = 'user-1'
    
    // Fetch user data directly from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        currency: true
      }
    })
    
    // CRITICAL DIAGNOSTIC LOG: What the dashboard actually reads from database
    console.log('DASHBOARD READS BALANCE:', user?.balance, 'Timestamp:', new Date().getTime())
    console.log('DASHBOARD READS USER DATA:', {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      balance: user?.balance,
      currency: user?.currency
    })
    
    // Fetch transactions directly from database
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        amount: true,
        description: true,
        category: true,
        type: true,
        date: true
      }
    })
    
    // Convert Decimal amounts to numbers and dates to Date objects
    const processedTransactions: Transaction[] = transactions.map(t => ({
      ...t,
      amount: Number(t.amount),
      date: new Date(t.date)
    }))
    
    console.log('DASHBOARD READS TRANSACTIONS COUNT:', processedTransactions.length)
    
    // Fetch recurring transactions
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        description: true,
        category: true,
        type: true,
        frequency: true,
        startDate: true,
        endDate: true,
        isActive: true
      }
    })
    
    // Convert Decimal amounts to numbers and dates to strings
    const processedRecurringTransactions: RecurringTransaction[] = recurringTransactions.map(rt => ({
      ...rt,
      amount: Number(rt.amount),
      startDate: rt.startDate.toISOString(),
      endDate: rt.endDate ? rt.endDate.toISOString() : undefined
    }))
    
    console.log('DASHBOARD READS RECURRING TRANSACTIONS COUNT:', processedRecurringTransactions.length)
    
    return {
      user: user ? {
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        balance: user.balance,
        currency: user.currency
      } : null,
      transactions: processedTransactions,
      recurringTransactions: processedRecurringTransactions
    }
  } catch (error) {
    console.error('❌ DASHBOARD: Error fetching data from database:', error)
    return { user: null, transactions: [], recurringTransactions: [] }
  }
}

export default async function DashboardPage() {
  // Fetch data directly from database (Server Component)
  const { user, transactions, recurringTransactions } = await getDashboardData()
  
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