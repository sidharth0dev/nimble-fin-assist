import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '../../../lib/auth'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

// Validation schema for recurring transaction data
const recurringTransactionSchema = z.object({
  amount: z.coerce.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a valid number'
  }).positive('Amount must be a positive number'),
  description: z.string().min(1, 'Description is required').max(255, 'Description too long'),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Transaction type is required' }),
  frequency: z.enum(['WEEKLY', 'MONTHLY'], { required_error: 'Frequency is required' }),
  startDate: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, 'Invalid start date format'),
  endDate: z.string().optional().refine((date) => {
    if (!date) return true // Optional field
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, 'Invalid end date format'),
  isActive: z.boolean().optional().default(true)
})

// GET - Fetch all recurring transactions for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ recurringTransactions })
  } catch (error) {
    console.error('Error fetching recurring transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new recurring transaction
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    console.log('🔐 Authenticated user ID:', userId)

    const body = await request.json()
    console.log('🔍 Received recurring transaction data:', body)
    
    const validatedData = recurringTransactionSchema.parse(body)
    console.log('✅ Validated data:', validatedData)

    const { amount, type, description, category, frequency, startDate, endDate, isActive } = validatedData
    
    const newRecurringTransaction = await prisma.recurringTransaction.create({
      data: {
        amount: new Decimal(amount),
        description: description,
        category: category,
        type: type,
        frequency: frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive,
        userId: userId,
      },
    })

    console.log('✅ Recurring transaction created with ID:', newRecurringTransaction.id)

    // Revalidate cache
    revalidatePath('/dashboard')
    revalidatePath('/transactions')

    return NextResponse.json(
      { 
        message: 'Recurring transaction created successfully',
        recurringTransaction: newRecurringTransaction
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ Error creating recurring transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


