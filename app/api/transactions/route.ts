import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '../../../lib/auth'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

// Strict validation schema for transaction data
const transactionSchema = z.object({
  amount: z.coerce.number({
    required_error: 'Amount is required',
    invalid_type_error: 'Amount must be a valid number'
  }).positive('Amount must be a positive number'),
  description: z.string().min(1, 'Description is required').max(255, 'Description too long'),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Transaction type is required' }),
  date: z.string().optional().refine((date) => {
    if (!date) return true // Optional field
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, 'Invalid date format'),
})

// GET - Fetch all transactions for authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request)
    
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

// POST - Create a new transaction with 100% atomic operations
export async function POST(request: NextRequest) {
  try {
    // Step 1: Get authenticated user ID
    const userId = getAuthenticatedUserId(request)
    console.log('🔐 Authenticated user ID:', userId)

    // Step 2: Parse and validate request body
    const body = await request.json()
    console.log('🔍 Received transaction data:', body)
    
    const validatedData = transactionSchema.parse(body)
    console.log('✅ Validated data:', validatedData)

    // Step 3: Extract validated data
    const { amount, type, description, category, date } = validatedData
    
    // Step 4: Calculate change amount (positive for income, negative for expense)
    const changeAmount = type === 'INCOME' ? amount : -amount
    console.log('💰 Change amount calculated:', { amount, type, changeAmount })

    // Step 5: Execute all operations atomically using Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log('🔄 Starting atomic transaction...')
      
      // Operation 1: Update user balance atomically using $increment
      console.log('📊 Updating user balance with increment:', changeAmount)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: changeAmount
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
          currency: true
        }
      })
      console.log('✅ User balance updated to:', updatedUser.balance)
      
      // Operation 2: Create transaction record
      console.log('📝 Creating transaction record...')
      const newTransaction = await tx.transaction.create({
        data: {
          amount: new Decimal(amount),
          description: description,
          category: category,
          type: type,
          date: date ? new Date(date) : new Date(),
          userId: userId,
        },
      })
      console.log('✅ Transaction created with ID:', newTransaction.id)

      // Operation 3: Update budget spent amount for EXPENSE transactions only
      let budgetUpdate = null
      if (type === 'EXPENSE') {
        console.log('💳 Updating budget for expense transaction...')
        budgetUpdate = await tx.budget.updateMany({
          where: {
            userId: userId,
            category: category
          },
          data: {
            spent: {
              increment: amount
            }
          }
        })
        console.log('✅ Budget updated, affected rows:', budgetUpdate.count)
      }

      return { updatedUser, newTransaction, budgetUpdate }
    })

    const { updatedUser, newTransaction, budgetUpdate } = result

    // Step 6: Log successful transaction
    console.log('🎉 Atomic transaction completed successfully:', {
      userId: updatedUser.id,
      newBalance: updatedUser.balance,
      transactionId: newTransaction.id,
      transactionAmount: newTransaction.amount.toString(),
      transactionType: newTransaction.type,
      budgetUpdated: type === 'EXPENSE' && budgetUpdate ? budgetUpdate.count > 0 : false,
      budgetUpdateCount: type === 'EXPENSE' && budgetUpdate ? budgetUpdate.count : 0
    })

    // CRITICAL DIAGNOSTIC LOG: Final success confirmation
    console.log('FINAL SUCCESS: Balance updated to:', updatedUser.balance, 'Cache bust initiated.')

    // Step 7: Revalidate cache for immediate UI updates (outside transaction)
    console.log('🔄 Revalidating cache paths...')
    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    revalidatePath('/budgets')
    revalidatePath('/')
    console.log('✅ Cache revalidation completed')

    // Step 8: Return success response
    return NextResponse.json(
      { 
        message: 'Transaction created successfully',
        transaction: newTransaction,
        user: updatedUser
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    // Handle database errors
    console.error('❌ Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}