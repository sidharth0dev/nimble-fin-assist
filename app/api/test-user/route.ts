import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Create test user for development (only if doesn't exist)
export async function POST(request: NextRequest) {
  try {
    // Use upsert for atomic create-or-update operation
    const user = await prisma.user.upsert({
      where: { id: 'user-1' },
      update: {
        // Don't reset balance - preserve existing balance
        currency: 'USD',
        name: 'Test User',
        email: 'test@example.com'
      },
      create: {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedpassword', // In real app, this would be properly hashed
        name: 'Test User',
        currency: 'USD',
        balance: 10000.00, // Initialize with $10,000 starting balance only on creation
      }
    })
    
    console.log('✅ Test user ready with balance:', user.balance)

    return NextResponse.json(
      { 
        message: 'Test user ready',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          currency: user.currency,
          balance: user.balance,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error creating test user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
