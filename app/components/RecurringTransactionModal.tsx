'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface RecurringTransaction {
  id: string
  amount: number
  description: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  frequency: 'WEEKLY' | 'MONTHLY'
  startDate: string
  endDate?: string
  isActive: boolean
}

interface RecurringTransactionModalProps {
  recurringTransactions: RecurringTransaction[]
}

export default function RecurringTransactionModal({ 
  recurringTransactions
}: RecurringTransactionModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    frequency: 'MONTHLY' as 'WEEKLY' | 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingTransaction 
        ? `/api/recurring-transactions/${editingTransaction.id}`
        : '/api/recurring-transactions'
      
      const method = editingTransaction ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          endDate: formData.endDate || null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save recurring transaction')
      }

      toast.success(
        editingTransaction 
          ? 'Recurring transaction updated successfully' 
          : 'Recurring transaction created successfully'
      )
      
      setIsOpen(false)
      setEditingTransaction(null)
      resetForm()
      router.refresh()
    } catch (error) {
      toast.error('Failed to save recurring transaction')
      console.error('Error saving recurring transaction:', error)
    }
  }

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction)
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      frequency: transaction.frequency,
      startDate: transaction.startDate.split('T')[0],
      endDate: transaction.endDate ? transaction.endDate.split('T')[0] : '',
      isActive: transaction.isActive
    })
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) {
      return
    }

    try {
      const response = await fetch(`/api/recurring-transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete recurring transaction')
      }

      toast.success('Recurring transaction deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete recurring transaction')
      console.error('Error deleting recurring transaction:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      category: '',
      type: 'EXPENSE',
      frequency: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true
    })
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setEditingTransaction(null)
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Manage Recurring Transactions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'INCOME' | 'EXPENSE') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: 'WEEKLY' | 'MONTHLY') => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingTransaction ? 'Update' : 'Create'} Recurring Transaction
              </Button>
            </form>
          </div>

          {/* List of existing recurring transactions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Existing Recurring Transactions</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recurringTransactions.map((transaction) => (
                <div key={transaction.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.amount} - {transaction.category} - {transaction.frequency}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.type} • {transaction.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {recurringTransactions.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recurring transactions yet</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
