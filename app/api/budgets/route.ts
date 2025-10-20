import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limit: z.number().positive('Limit must be positive'),
  period: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  userId: z.string().min(1, 'User ID is required'),
})

// GET - Fetch all budgets for a user
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

    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ budgets })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received budget data:', body)
    
    const validatedData = budgetSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    })

    if (!user) {
      console.error('User not found:', validatedData.userId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if budget already exists for this category and user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: validatedData.userId,
        category: validatedData.category,
        period: validatedData.period,
      }
    })

    if (existingBudget) {
      return NextResponse.json(
        { error: 'Budget already exists for this category and period' },
        { status: 400 }
      )
    }

    // Convert limit to Decimal for Prisma
    const budget = await prisma.budget.create({
      data: {
        category: validatedData.category,
        limit: new Decimal(validatedData.limit),
        period: validatedData.period,
        userId: validatedData.userId,
      },
    })

    console.log('Budget created successfully:', budget)

    // Revalidate cache for relevant pages
    revalidatePath('/budgets')
    revalidatePath('/dashboard')

    return NextResponse.json(
      { 
        message: 'Budget created successfully',
        budget 
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating budget:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


