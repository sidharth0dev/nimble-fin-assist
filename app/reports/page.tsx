'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Mock data for spending over time
const spendingOverTimeData = [
  { month: 'Jul', amount: 2050 },
  { month: 'Aug', amount: 1900 },
  { month: 'Sep', amount: 2250 },
  { month: 'Oct', amount: 1850 },
]

// Mock data for spending by category
const spendingByCategoryData = [
  { name: 'Bills & Utilities', value: 37, amount: 1850, color: '#A855F7' },
  { name: 'Food & Dining', value: 24, amount: 1200, color: '#3B82F6' },
  { name: 'Shopping', value: 17, amount: 850, color: '#22D3EE' },
  { name: 'Entertainment', value: 12, amount: 600, color: '#F97316' },
  { name: 'Transportation', value: 10, amount: 500, color: '#22C55E' },
]

const COLORS = ['#3B82F6', '#22D3EE', '#22C55E', '#F97316', '#A855F7']

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-gray-400">Visualize your spending patterns and financial trends.</p>
        </div>

        {/* Spending Over Time */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Spending Over Time</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={spendingOverTimeData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Spending by Category</h2>
          <div className="flex items-center justify-between">
            <div className="h-80 w-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {spendingByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 ml-8">
              <div className="space-y-3">
                {spendingByCategoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white text-sm">
                      {item.name}: {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-gray-300 text-sm mb-2">Average Monthly Spending</h3>
            <p className="text-2xl font-bold text-white">$2,050</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-gray-300 text-sm mb-2">Highest Category</h3>
            <p className="text-2xl font-bold text-white">Bills</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-gray-300 text-sm mb-2">Total Transactions</h3>
            <p className="text-2xl font-bold text-white">87</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-gray-300 text-sm mb-2">Savings Rate</h3>
            <p className="text-2xl font-bold text-green-500">18%</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
