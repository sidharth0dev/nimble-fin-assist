'use client'

import { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, ArrowUpRight, ArrowDownLeft, Filter, X, Calendar, DollarSign } from 'lucide-react'
import AddTransactionModal from '@/components/AddTransactionModal'
import { addTransactionAction } from '@/actions/transactions'
import { format } from 'date-fns'

interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  date: Date
}

interface FilterState {
  searchTerm: string
  type: 'ALL' | 'INCOME' | 'EXPENSE'
  category: string
  dateFrom: string
  dateTo: string
  amountMin: string
  amountMax: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    type: 'ALL',
    category: 'ALL',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  })

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      // Ensure test user exists first
      await fetch('/api/test-user', { method: 'POST' })
      
      const userId = 'user-1' // Using test user ID
      const response = await fetch(`/api/transactions?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        // Convert date strings to Date objects and ensure amounts are numbers
        const transactionsWithDates = data.transactions.map((t: any) => ({
          ...t,
          date: new Date(t.date),
          amount: Number(t.amount) // Ensure amount is a number
        }))
        
        // Debug logging
        console.log('Fetched transactions:', transactionsWithDates.length)
        console.log('Sample transaction:', transactionsWithDates[0])
        console.log('Amount types:', transactionsWithDates.map((t: any) => ({ id: t.id, amount: t.amount, type: typeof t.amount })))
        
        setTransactions(transactionsWithDates)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleTransactionAdded = () => {
    // Refresh transactions when a new one is added
    fetchTransactions()
  }

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(transactions.map(t => t.category))]
    return uniqueCategories.sort()
  }, [transactions])

  // Apply all filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        if (!transaction.description.toLowerCase().includes(searchLower) &&
            !transaction.category.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // Type filter
      if (filters.type !== 'ALL' && transaction.type !== filters.type) {
        return false
      }

      // Category filter
      if (filters.category !== 'ALL' && transaction.category !== filters.category) {
        return false
      }

      // Date range filter
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        if (transaction.date < fromDate) {
          return false
        }
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999) // Include the entire day
        if (transaction.date > toDate) {
          return false
        }
      }

      // Amount range filter
      if (filters.amountMin) {
        const minAmount = parseFloat(filters.amountMin)
        if (transaction.amount < minAmount) {
          return false
        }
      }
      if (filters.amountMax) {
        const maxAmount = parseFloat(filters.amountMax)
        if (transaction.amount > maxAmount) {
          return false
        }
      }

      return true
    })
  }, [transactions, filters])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.type !== 'ALL') count++
    if (filters.category !== 'ALL') count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.amountMin) count++
    if (filters.amountMax) count++
    return count
  }, [filters])

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      type: 'ALL',
      category: 'ALL',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    })
  }

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const formatCurrency = (amount: number) => {
    // Ensure amount is a valid number
    const numAmount = Number(amount)
    if (isNaN(numAmount)) {
      console.error('Invalid amount for formatting:', amount)
      return '$0.00'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(numAmount))
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
            <p className="text-gray-400">View and manage all your transactions.</p>
          </div>
          <AddTransactionModal action={addTransactionAction} />
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search transactions..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-600 text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Filter Transactions</CardTitle>
                <div className="flex gap-2">
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Transaction Type Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Transaction Type</label>
                  <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                  <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filters */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date To
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Amount Range Filters */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Min Amount
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filters.amountMin}
                    onChange={(e) => updateFilter('amountMin', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Max Amount
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={filters.amountMax}
                    onChange={(e) => updateFilter('amountMax', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Quick Filter Presets */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-400">Quick filters:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                      setFilters(prev => ({
                        ...prev,
                        dateFrom: lastWeek.toISOString().split('T')[0],
                        dateTo: today.toISOString().split('T')[0]
                      }))
                    }}
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
                      setFilters(prev => ({
                        ...prev,
                        dateFrom: lastMonth.toISOString().split('T')[0],
                        dateTo: today.toISOString().split('T')[0]
                      }))
                    }}
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    Last 30 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, type: 'INCOME' }))}
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    Income only
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, type: 'EXPENSE' }))}
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    Expenses only
                  </Button>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-400">Active filters:</span>
                    {filters.type !== 'ALL' && (
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        Type: {filters.type}
                      </Badge>
                    )}
                    {filters.category !== 'ALL' && (
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        Category: {filters.category}
                      </Badge>
                    )}
                    {filters.dateFrom && (
                      <Badge variant="secondary" className="bg-purple-600 text-white">
                        From: {format(new Date(filters.dateFrom), 'MMM d, yyyy')}
                      </Badge>
                    )}
                    {filters.dateTo && (
                      <Badge variant="secondary" className="bg-purple-600 text-white">
                        To: {format(new Date(filters.dateTo), 'MMM d, yyyy')}
                      </Badge>
                    )}
                    {filters.amountMin && (
                      <Badge variant="secondary" className="bg-orange-600 text-white">
                        Min: ${filters.amountMin}
                      </Badge>
                    )}
                    {filters.amountMax && (
                      <Badge variant="secondary" className="bg-orange-600 text-white">
                        Max: ${filters.amountMax}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        {!loading && (
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              Showing {filteredTransactions.length} of {transactions.length} transactions
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-blue-400">
                  ({activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied)
                </span>
              )}
            </div>
            {filteredTransactions.length > 0 && (() => {
              const incomeTotal = filteredTransactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => {
                  const amount = Number(t.amount)
                  console.log('Income transaction:', { id: t.id, amount: t.amount, converted: amount, sum })
                  return sum + amount
                }, 0)
              
              const expenseTotal = filteredTransactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => {
                  const amount = Number(t.amount)
                  console.log('Expense transaction:', { id: t.id, amount: t.amount, converted: amount, sum })
                  return sum + amount
                }, 0)
              
              console.log('Totals:', { incomeTotal, expenseTotal })
              
              return (
                <div className="flex items-center gap-4">
                  <div className="text-green-500">
                    Income: {formatCurrency(incomeTotal)}
                  </div>
                  <div className="text-red-500">
                    Expenses: {formatCurrency(expenseTotal)}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Transactions List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {transactions.length === 0 
                  ? "No transactions found. Add your first transaction to get started!"
                  : "No transactions match your current filters. Try adjusting your search criteria."
                }
              </p>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4 bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
            const isIncome = transaction.type === 'INCOME'
            const iconColor = isIncome ? 'bg-green-600' : 'bg-orange-600'
            const amountColor = isIncome ? 'text-green-500' : 'text-red-500'
            const amountPrefix = isIncome ? '+' : '-'

            return (
              <div
                key={transaction.id}
                className="rounded-xl border border-gray-800 bg-gray-900/90 shadow transition-all hover:shadow-lg"
              >
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-[auto,1fr,auto] items-center gap-4">
                  <div className={`h-10 w-10 rounded-full ${iconColor} flex items-center justify-center`}>
                    {isIncome ? (
                      <ArrowDownLeft className="h-5 w-5 text-white" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{transaction.description}</h3>
                    <p className="text-sm text-gray-400 truncate">
                      {transaction.category} • {format(transaction.date, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className={`font-semibold ${amountColor} sm:text-right`}>
                    {amountPrefix}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
