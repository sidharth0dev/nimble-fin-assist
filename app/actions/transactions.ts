'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

// Strict validation schema for transaction data
const transactionSchema = z.object({
  amount: z.number({
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

export async function addTransactionAction(formData: FormData) {
  try {
    console.log('🔍 SERVER ACTION: Starting transaction creation...')
    
    // Extract data from FormData with proper null/empty string handling
    const amountString = formData.get('amount') as string | null
    const descriptionRaw = formData.get('description') as string | null
    const categoryRaw = formData.get('category') as string | null
    const typeRaw = formData.get('type') as string | null
    const dateRaw = formData.get('date') as string | null
    
    console.log('🔍 SERVER ACTION: Raw form data:', {
      amountString,
      descriptionRaw,
      categoryRaw,
      typeRaw,
      dateRaw
    })
    
    // Clean and validate required string fields
    const description = descriptionRaw?.trim() || ''
    const category = categoryRaw?.trim() || ''
    const type = typeRaw?.trim() || ''
    const date = dateRaw?.trim() || undefined
    
    console.log('🔍 SERVER ACTION: Cleaned form data:', {
      description,
      category,
      type,
      date
    })
    
    // Validate required fields before Zod validation
    if (!description) {
      console.error('❌ SERVER ACTION: Description is required')
      return {
        success: false,
        error: 'Validation error',
        details: 'Description is required'
      }
    }
    
    if (!category) {
      console.error('❌ SERVER ACTION: Category is required')
      return {
        success: false,
        error: 'Validation error',
        details: 'Category is required'
      }
    }
    
    if (!type || !['INCOME', 'EXPENSE'].includes(type)) {
      console.error('❌ SERVER ACTION: Valid transaction type is required')
      return {
        success: false,
        error: 'Validation error',
        details: 'Transaction type must be INCOME or EXPENSE'
      }
    }
    
    // Explicitly convert amount to number and validate
    const parsedAmount = parseFloat(amountString || '')
    console.log('🔢 SERVER ACTION: Parsed amount:', parsedAmount)
    
    // Handle NaN case
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error('❌ SERVER ACTION: Invalid amount provided:', amountString)
      return {
        success: false,
        error: 'Validation error',
        details: 'Amount must be a valid positive number'
      }
    }
    
    // Prepare data for validation with properly typed and cleaned values
    const rawData = {
      amount: parsedAmount,
      description,
      category,
      type,
      date
    }
    
    console.log('🔍 SERVER ACTION: Prepared data for validation:', rawData)
    
    // Validate the data
    const validatedData = transactionSchema.parse(rawData)
    console.log('✅ SERVER ACTION: Validated data:', validatedData)

    // Use test user ID for now (you can modify this to use authentication later)
    const userId = 'user-1'
    console.log('🔐 SERVER ACTION: Using user ID:', userId)

    // Extract validated data
    const { amount, type: transactionType, description: transactionDescription, category: transactionCategory, date: transactionDate } = validatedData
    
    // Calculate change amount (positive for income, negative for expense)
    const changeAmount = transactionType === 'INCOME' ? amount : -amount
    console.log('💰 SERVER ACTION: Change amount calculated:', { amount, type: transactionType, changeAmount })

    // Execute all operations atomically using Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log('🔄 SERVER ACTION: Starting atomic transaction...')
      
      // Operation 1: Update user balance atomically using $increment
      console.log('📊 SERVER ACTION: Updating user balance with increment:', changeAmount)
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
      console.log('✅ SERVER ACTION: User balance updated to:', updatedUser.balance)
      
      // Operation 2: Create transaction record
      console.log('📝 SERVER ACTION: Creating transaction record...')
      const newTransaction = await tx.transaction.create({
        data: {
          amount: new Decimal(amount),
          description: transactionDescription,
          category: transactionCategory,
          type: transactionType,
          date: transactionDate ? new Date(transactionDate) : new Date(),
          userId: userId,
        },
      })
      console.log('✅ SERVER ACTION: Transaction created with ID:', newTransaction.id)

      // Operation 3: Update budget spent amount for EXPENSE transactions only
      let budgetUpdate = null
      if (transactionType === 'EXPENSE') {
        console.log('💳 SERVER ACTION: Updating budget for expense transaction...')
        budgetUpdate = await tx.budget.updateMany({
          where: {
            userId: userId,
            category: transactionCategory
          },
          data: {
            spent: {
              increment: amount
            }
          }
        })
        console.log('✅ SERVER ACTION: Budget updated, affected rows:', budgetUpdate.count)
      }

      return { updatedUser, newTransaction, budgetUpdate }
    })

    const { updatedUser, newTransaction, budgetUpdate } = result

    // Log successful transaction
    console.log('🎉 SERVER ACTION: Atomic transaction completed successfully:', {
      userId: updatedUser.id,
      newBalance: updatedUser.balance,
      transactionId: newTransaction.id,
      transactionAmount: newTransaction.amount.toString(),
      transactionType: newTransaction.type,
      budgetUpdated: transactionType === 'EXPENSE' && budgetUpdate ? budgetUpdate.count > 0 : false,
      budgetUpdateCount: transactionType === 'EXPENSE' && budgetUpdate ? budgetUpdate.count : 0
    })

    // CRITICAL DIAGNOSTIC LOG: Final success confirmation
    console.log('FINAL SUCCESS: Balance updated to:', updatedUser.balance, 'Cache bust initiated.')

  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error('❌ SERVER ACTION: Validation error:', error.errors)
      return {
        success: false,
        error: 'Validation error',
        details: error.errors
      }
    }

    // Handle database errors
    console.error('❌ SERVER ACTION: Error creating transaction:', error)
    return {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Redirect to dashboard - this automatically triggers cache invalidation and fresh data fetch
  // Move redirect outside try-catch to prevent NEXT_REDIRECT error from being caught
  console.log('🔄 SERVER ACTION: Redirecting to dashboard for fresh data...')
  redirect('/dashboard')
}
