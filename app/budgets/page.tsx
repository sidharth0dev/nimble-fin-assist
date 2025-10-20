'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Plus } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { formatCurrency } from '@/lib/currency'

const categories = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Other',
]

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
  period: 'MONTHLY' | 'YEARLY'
}

export default function BudgetsPage() {
  const { currency } = useCurrency()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: '',
  })

  // Ensure test user exists and fetch budgets from API
  const fetchBudgets = async () => {
    try {
      // For now, using a hardcoded userId - in a real app, this would come from auth
      const userId = 'user-1' // This should be replaced with actual user ID from auth
      
      // First, ensure test user exists
      await fetch('/api/test-user', { method: 'POST' })
      
      const response = await fetch(`/api/budgets?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setBudgets(data.budgets || [])
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [])

  const handleCreateBudget = async () => {
    if (!newBudget.category || !newBudget.limit) return

    try {
      const userId = 'user-1' // This should be replaced with actual user ID from auth
      
      // Ensure test user exists before creating budget
      await fetch('/api/test-user', { method: 'POST' })
      
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: newBudget.category,
          limit: parseFloat(newBudget.limit),
          period: 'MONTHLY',
          userId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBudgets([...budgets, data.budget])
        setNewBudget({ category: '', limit: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create budget')
      }
    } catch (error) {
      console.error('Error creating budget:', error)
      alert('Failed to create budget')
    }
  }


  const getRemainingAmount = (limit: number, spent: number) => {
    return Math.max(0, limit - spent)
  }

  const getSpentPercentage = (limit: number, spent: number) => {
    return Math.min(100, (spent / limit) * 100)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Budgets</h1>
            <p className="text-gray-400">Track your spending against your budget limits.</p>
          </div>
        </div>

        {/* Create New Budget */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">+ Create New Budget</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="category" className="text-white">Category</Label>
              <Select value={newBudget.category} onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="limit" className="text-white">Budget Limit</Label>
              <Input
                id="limit"
                type="number"
                placeholder="0.00"
                value={newBudget.limit}
                onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button 
              onClick={handleCreateBudget}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Budget
            </Button>
          </div>
        </div>

        {/* Active Budgets */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Active Budgets</h2>
          {loading ? (
            <div className="text-gray-400">Loading budgets...</div>
          ) : budgets.length === 0 ? (
            <div className="text-gray-400">No budgets created yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => {
              const remaining = getRemainingAmount(budget.limit, budget.spent)
              const percentage = getSpentPercentage(budget.limit, budget.spent)

              return (
                <div key={budget.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{budget.category}</h3>
                    <span className="text-sm text-gray-400">{percentage.toFixed(1)}%</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-300">
                        {formatCurrency(budget.spent, currency)} of {formatCurrency(budget.limit, currency)}
                      </span>
                      <span className="text-green-500 font-medium">
                        {formatCurrency(remaining, currency)} remaining
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}


