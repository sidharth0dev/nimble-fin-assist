import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/currency'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface ForecastData {
  month: string
  balance: number
  change: number
  recurringIncome: number
  recurringExpenses: number
}

interface ForecastCardProps {
  userId: string
  currentBalance: number
  currency: string
}

// Helper function to get the next occurrence of a recurring transaction
function getNextOccurrence(startDate: Date, frequency: 'WEEKLY' | 'MONTHLY', monthsFromNow: number): Date {
  const nextDate = new Date(startDate)
  
  if (frequency === 'WEEKLY') {
    // For weekly, calculate how many weeks from start date
    const weeksFromStart = monthsFromNow * 4.33 // Approximate weeks per month
    nextDate.setDate(nextDate.getDate() + (weeksFromStart * 7))
  } else {
    // For monthly, add months
    nextDate.setMonth(nextDate.getMonth() + monthsFromNow)
  }
  
  return nextDate
}

// Helper function to check if a recurring transaction should occur in a given month
function shouldOccurInMonth(
  startDate: Date, 
  endDate: Date | null, 
  frequency: 'WEEKLY' | 'MONTHLY', 
  targetMonth: Date,
  isActive: boolean
): boolean {
  if (!isActive) return false
  
  // Check if we're past the end date
  if (endDate && targetMonth > endDate) return false
  
  // Check if we're before the start date
  if (targetMonth < startDate) return false
  
  if (frequency === 'MONTHLY') {
    // For monthly, check if the target month is on or after start date
    return targetMonth >= startDate
  } else {
    // For weekly, check if the target month contains any occurrences
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1)
    const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0)
    
    // Check if any weekly occurrence falls within this month
    let currentDate = new Date(startDate)
    while (currentDate <= monthEnd) {
      if (currentDate >= monthStart && currentDate <= monthEnd) {
        return true
      }
      currentDate.setDate(currentDate.getDate() + 7)
    }
    return false
  }
}

// Server component that calculates forecast data
async function getForecastData(userId: string, currentBalance: number): Promise<ForecastData[]> {
  try {
    // Get all recurring transactions for the user
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { 
        userId,
        isActive: true 
      }
    })

    // Get actual transactions for the last 3 months to calculate average spending patterns
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: threeMonthsAgo
        }
      },
      orderBy: { date: 'desc' }
    })

    // Calculate average monthly spending by category (excluding recurring transactions)
    const monthlyAverages: { [category: string]: number } = {}
    const categoryCounts: { [category: string]: number } = {}
    
    recentTransactions.forEach(transaction => {
      const monthKey = `${transaction.date.getFullYear()}-${transaction.date.getMonth()}`
      if (!monthlyAverages[transaction.category]) {
        monthlyAverages[transaction.category] = 0
        categoryCounts[transaction.category] = 0
      }
      
      if (transaction.type === 'EXPENSE') {
        monthlyAverages[transaction.category] += Number(transaction.amount)
        categoryCounts[transaction.category]++
      }
    })

    // Calculate averages
    Object.keys(monthlyAverages).forEach(category => {
      if (categoryCounts[category] > 0) {
        monthlyAverages[category] = monthlyAverages[category] / (categoryCounts[category] / 3) // Average over 3 months
      }
    })

    // Generate forecast for next 6 months
    const forecast: ForecastData[] = []
    let runningBalance = currentBalance

    for (let monthOffset = 1; monthOffset <= 6; monthOffset++) {
      const targetDate = new Date()
      targetDate.setMonth(targetDate.getMonth() + monthOffset)
      
      const monthName = targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      let recurringIncome = 0
      let recurringExpenses = 0
      
      // Calculate recurring transactions for this month
      recurringTransactions.forEach(rt => {
        if (shouldOccurInMonth(rt.startDate, rt.endDate, rt.frequency, targetDate, rt.isActive)) {
          if (rt.type === 'INCOME') {
            recurringIncome += Number(rt.amount)
          } else {
            recurringExpenses += Number(rt.amount)
          }
        }
      })
      
      // Add average non-recurring expenses (simplified assumption)
      let averageNonRecurringExpenses = 0
      Object.values(monthlyAverages).forEach(avg => {
        averageNonRecurringExpenses += avg
      })
      
      // Calculate net change for this month
      const netChange = recurringIncome - recurringExpenses - (averageNonRecurringExpenses * 0.3) // Assume 30% of average spending continues
      
      // Update running balance
      const previousBalance = runningBalance
      runningBalance += netChange
      
      forecast.push({
        month: monthName,
        balance: runningBalance,
        change: netChange,
        recurringIncome,
        recurringExpenses
      })
    }

    return forecast
  } catch (error) {
    console.error('Error calculating forecast data:', error)
    return []
  }
}

export default async function ForecastCard({ userId, currentBalance, currency }: ForecastCardProps) {
  const forecastData = await getForecastData(userId, currentBalance)
  
  if (forecastData.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Balance Forecast
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-400">No forecast data available. Add some recurring transactions to see your balance projection.</p>
        </div>
      </div>
    )
  }

  const finalBalance = forecastData[forecastData.length - 1]?.balance || currentBalance
  const totalChange = finalBalance - currentBalance
  const isPositive = totalChange >= 0

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Balance Forecast (6 Months)
      </h2>
      
      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">Projected Balance in 6 months:</span>
          <span className="text-2xl font-bold text-white">
            {formatCurrency(finalBalance, currency)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{formatCurrency(totalChange, currency)}
          </span>
          <span className="text-sm text-gray-400">
            ({isPositive ? '+' : ''}{((totalChange / currentBalance) * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white">Monthly Projections</h3>
        {forecastData.map((month, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-white font-medium">{month.month}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                {formatCurrency(month.balance, currency)}
              </div>
              <div className={`text-sm ${month.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {month.change >= 0 ? '+' : ''}{formatCurrency(month.change, currency)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Recurring Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Recurring Expenses</span>
          </div>
        </div>
      </div>
    </div>
  )
}


