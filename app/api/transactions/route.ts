import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
})

// GET - Fetch all transactions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = transactionSchema.parse(body)

    const transaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        category: validatedData.category,
        type: validatedData.type,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        userId: validatedData.userId,
      },
    })

    return NextResponse.json(
      { 
        message: 'Transaction created successfully',
        transaction 
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
