import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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
    const validatedData = budgetSchema.parse(body)

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

    const budget = await prisma.budget.create({
      data: {
        category: validatedData.category,
        limit: validatedData.limit,
        period: validatedData.period,
        userId: validatedData.userId,
      },
    })

    return NextResponse.json(
      { 
        message: 'Budget created successfully',
        budget 
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

    console.error('Error creating budget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
