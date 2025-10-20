import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Reset user balance to 0 (for testing)
export async function POST(request: NextRequest) {
  try {
    const userId = 'user-1' // Using test user ID
    
    // Reset user balance to 0
    const user = await prisma.user.update({
      where: { id: userId },
      data: { balance: 0.0 },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        currency: true
      }
    })

    console.log('🔄 Reset user balance to:', user.balance)

    return NextResponse.json({
      message: 'Balance reset successfully',
      user
    })
  } catch (error) {
    console.error('Reset balance error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


