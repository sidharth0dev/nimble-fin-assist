import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Debug endpoint to check user balance and transactions
export async function GET(request: NextRequest) {
  try {
    const userId = 'user-1' // Using test user ID
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        currency: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get all transactions for this user
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        description: true,
        category: true,
        type: true,
        date: true,
        createdAt: true
      }
    })

    // Calculate expected balance from transactions
    const calculatedBalance = transactions.reduce((sum, transaction) => {
      const amount = Number(transaction.amount)
      return transaction.type === 'INCOME' 
        ? sum + amount 
        : sum - amount
    }, 0)

    return NextResponse.json({
      user,
      transactions,
      calculatedBalance,
      balanceMatch: Number(user.balance) === calculatedBalance,
      debug: {
        userBalance: user.balance,
        userBalanceType: typeof user.balance,
        calculatedBalance,
        calculatedBalanceType: typeof calculatedBalance,
        transactionCount: transactions.length
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


