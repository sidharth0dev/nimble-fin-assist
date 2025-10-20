import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const settingsSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  userId: z.string().min(1, 'User ID is required'),
})

// GET - Fetch user settings
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        currency: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = settingsSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: validatedData.userId },
      data: {
        currency: validatedData.currency,
      },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        currency: true,
      },
    })

    // Revalidate cache for relevant pages
    revalidatePath('/settings')
    revalidatePath('/dashboard')
    revalidatePath('/transactions')
    revalidatePath('/budgets')

    return NextResponse.json(
      { 
        message: 'Settings updated successfully',
        user 
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
