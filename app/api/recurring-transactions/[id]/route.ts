import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserId } from '../../../../lib/auth'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

// Validation schema for updating recurring transaction data
const updateRecurringTransactionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be a positive number').optional(),
  description: z.string().min(1, 'Description is required').max(255, 'Description too long').optional(),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long').optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  frequency: z.enum(['WEEKLY', 'MONTHLY']).optional(),
  startDate: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, 'Invalid start date format').optional(),
  endDate: z.string().optional().refine((date) => {
    if (!date) return true // Optional field
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, 'Invalid end date format'),
  isActive: z.boolean().optional()
})

// PUT - Update a recurring transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getAuthenticatedUserId(request)
    const { id } = await params

    const body = await request.json()
    const validatedData = updateRecurringTransactionSchema.parse(body)

    // Check if the recurring transaction belongs to the user
    const existingRecurringTransaction = await prisma.recurringTransaction.findFirst({
      where: { id, userId }
    })

    if (!existingRecurringTransaction) {
      return NextResponse.json(
        { error: 'Recurring transaction not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (validatedData.amount !== undefined) updateData.amount = new Decimal(validatedData.amount)
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.type !== undefined) updateData.type = validatedData.type
    if (validatedData.frequency !== undefined) updateData.frequency = validatedData.frequency
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate)
    if (validatedData.endDate !== undefined) updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive

    const updatedRecurringTransaction = await prisma.recurringTransaction.update({
      where: { id },
      data: updateData
    })

    // Revalidate cache
    revalidatePath('/dashboard')
    revalidatePath('/transactions')

    return NextResponse.json({
      message: 'Recurring transaction updated successfully',
      recurringTransaction: updatedRecurringTransaction
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ Error updating recurring transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a recurring transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getAuthenticatedUserId(request)
    const { id } = await params

    // Check if the recurring transaction belongs to the user
    const existingRecurringTransaction = await prisma.recurringTransaction.findFirst({
      where: { id, userId }
    })

    if (!existingRecurringTransaction) {
      return NextResponse.json(
        { error: 'Recurring transaction not found' },
        { status: 404 }
      )
    }

    await prisma.recurringTransaction.delete({
      where: { id }
    })

    // Revalidate cache
    revalidatePath('/dashboard')
    revalidatePath('/transactions')

    return NextResponse.json({
      message: 'Recurring transaction deleted successfully'
    })
  } catch (error) {
    console.error('❌ Error deleting recurring transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
