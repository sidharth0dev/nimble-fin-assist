'use client'

import { motion } from 'framer-motion'
import InsightsCard from './InsightsCard'
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

export default function AnimatedReports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-gray-400">Visualize your spending patterns and financial trends.</p>
      </motion.div>

      {/* AI Insights Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <InsightsCard />
      </motion.div>

      {/* Spending Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors duration-300"
      >
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
      </motion.div>

      {/* Spending by Category */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors duration-300"
      >
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
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white text-sm">
                    {item.name}: {item.value}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { title: "Average Monthly Spending", value: "$2,050", color: "text-white" },
          { title: "Highest Category", value: "Bills", color: "text-white" },
          { title: "Total Transactions", value: "87", color: "text-white" },
          { title: "Savings Rate", value: "18%", color: "text-green-500" }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-pointer"
          >
            <h3 className="text-gray-300 text-sm mb-2">{card.title}</h3>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}


