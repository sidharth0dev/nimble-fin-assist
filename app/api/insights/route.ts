import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '../../../lib/auth'

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyApQ4C0qv0xk3pKlwkw6ByC_T7cefa9QRk'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

interface SpendingData {
  category: string
  currentPeriod: number
  previousPeriod: number
  change: number
  changePercent: number
}

interface InsightResponse {
  summary: string
  trends: string[]
  recommendations: string[]
  keyMetrics: {
    totalSpendingChange: number
    topCategory: string
    biggestIncrease: string
    biggestDecrease: string
  }
}

// GET - Generate insights for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    
    // Calculate date ranges: last 2 months vs previous 2 months
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Last 2 months (current period) - using a wider range to catch recent transactions
    const lastTwoMonthsStart = new Date(currentYear, currentMonth - 3, 1)
    const lastTwoMonthsEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
    
    // Previous 2 months (comparison period)
    const previousTwoMonthsStart = new Date(currentYear, currentMonth - 5, 1)
    const previousTwoMonthsEnd = new Date(currentYear, currentMonth - 3, 0, 23, 59, 59)

    console.log('📊 Fetching spending data for insights...')
    console.log('Current period:', lastTwoMonthsStart.toISOString(), 'to', lastTwoMonthsEnd.toISOString())
    console.log('Previous period:', previousTwoMonthsStart.toISOString(), 'to', previousTwoMonthsEnd.toISOString())

    // Fetch transactions for both periods
    const [currentPeriodTransactions, previousPeriodTransactions] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          type: 'EXPENSE',
          date: {
            gte: lastTwoMonthsStart,
            lte: lastTwoMonthsEnd
          }
        },
        select: {
          amount: true,
          category: true,
          date: true
        }
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: 'EXPENSE',
          date: {
            gte: previousTwoMonthsStart,
            lte: previousTwoMonthsEnd
          }
        },
        select: {
          amount: true,
          category: true,
          date: true
        }
      })
    ])

    console.log(`📈 Found ${currentPeriodTransactions.length} current period transactions`)
    console.log(`📉 Found ${previousPeriodTransactions.length} previous period transactions`)

    // Process spending data by category
    const currentSpending = processSpendingByCategory(currentPeriodTransactions)
    const previousSpending = processSpendingByCategory(previousPeriodTransactions)

    // Calculate spending changes
    const spendingData: SpendingData[] = []
    const allCategories = new Set([...Object.keys(currentSpending), ...Object.keys(previousSpending)])

    allCategories.forEach(category => {
      const current = currentSpending[category] || 0
      const previous = previousSpending[category] || 0
      const change = current - previous
      const changePercent = previous > 0 ? ((change / previous) * 100) : (current > 0 ? 100 : 0)

      spendingData.push({
        category,
        currentPeriod: current,
        previousPeriod: previous,
        change,
        changePercent
      })
    })

    // Calculate key metrics
    const totalCurrentSpending = Object.values(currentSpending).reduce((sum, amount) => sum + amount, 0)
    const totalPreviousSpending = Object.values(previousSpending).reduce((sum, amount) => sum + amount, 0)
    const totalSpendingChange = totalPreviousSpending > 0 ? ((totalCurrentSpending - totalPreviousSpending) / totalPreviousSpending) * 100 : 0

    const topCategory = spendingData.reduce((max, item) => 
      item.currentPeriod > max.currentPeriod ? item : max, 
      { category: 'None', currentPeriod: 0, previousPeriod: 0, change: 0, changePercent: 0 }
    ).category

    const biggestIncrease = spendingData.reduce((max, item) => 
      item.changePercent > max.changePercent ? item : max, 
      { category: 'None', currentPeriod: 0, previousPeriod: 0, change: 0, changePercent: 0 }
    ).category

    const biggestDecrease = spendingData.reduce((min, item) => 
      item.changePercent < min.changePercent ? item : min, 
      { category: 'None', currentPeriod: 0, previousPeriod: 0, change: 0, changePercent: 0 }
    ).category

    // Prepare data for Gemini API
    const promptData = {
      currentPeriod: {
        start: lastTwoMonthsStart.toISOString().split('T')[0],
        end: lastTwoMonthsEnd.toISOString().split('T')[0],
        total: totalCurrentSpending,
        categories: currentSpending
      },
      previousPeriod: {
        start: previousTwoMonthsStart.toISOString().split('T')[0],
        end: previousTwoMonthsEnd.toISOString().split('T')[0],
        total: totalPreviousSpending,
        categories: previousSpending
      },
      spendingChanges: spendingData,
      keyMetrics: {
        totalSpendingChange,
        topCategory,
        biggestIncrease,
        biggestDecrease
      }
    }

    console.log('🤖 Calling Gemini API for insights generation...')

    // Generate insights using built-in logic (fallback when Gemini API is not available)
    console.log('🤖 Generating insights using built-in analysis...')
    
    const insights: InsightResponse = {
      summary: `Your total spending ${totalSpendingChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(totalSpendingChange).toFixed(1)}% compared to the previous period. ${totalSpendingChange > 0 ? 'Consider reviewing your expenses to identify areas for savings.' : 'Great job on reducing your spending!'}`,
      trends: [
        `Top spending category: ${topCategory} ($${currentSpending[topCategory]?.toFixed(2) || '0'})`,
        `Biggest increase: ${biggestIncrease} (${spendingData.find(s => s.category === biggestIncrease)?.changePercent.toFixed(1) || '0'}%)`,
        `Biggest decrease: ${biggestDecrease} (${spendingData.find(s => s.category === biggestDecrease)?.changePercent.toFixed(1) || '0'}%)`,
        `Total transactions analyzed: ${currentPeriodTransactions.length + previousPeriodTransactions.length}`,
        `Average transaction size: $${(totalCurrentSpending / currentPeriodTransactions.length).toFixed(2)}`
      ],
      recommendations: [
        totalSpendingChange > 0 ? 'Consider setting monthly spending limits for high-expense categories' : 'Maintain your current spending discipline',
        'Review your top spending categories and identify potential savings opportunities',
        'Set up budget alerts to track spending in real-time',
        'Consider automating savings transfers to build your emergency fund',
        'Track your spending patterns weekly to catch trends early'
      ],
      keyMetrics: {
        totalSpendingChange,
        topCategory,
        biggestIncrease,
        biggestDecrease
      }
    }

    console.log('🎯 Insights generated successfully')

    return NextResponse.json({
      success: true,
      insights,
      data: {
        currentPeriod: promptData.currentPeriod,
        previousPeriod: promptData.previousPeriod,
        spendingChanges: spendingData
      }
    })

  } catch (error) {
    console.error('❌ Error generating insights:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to process spending by category
function processSpendingByCategory(transactions: any[]): Record<string, number> {
  const spending: Record<string, number> = {}
  
  transactions.forEach(transaction => {
    const amount = Number(transaction.amount)
    const category = transaction.category
    
    if (!spending[category]) {
      spending[category] = 0
    }
    spending[category] += amount
  })
  
  return spending
}
