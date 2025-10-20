'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  Loader2, 
  Sparkles,
  Target,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface InsightData {
  summary: string
  trends: string[]
  recommendations: string[]
  keyMetrics: {
    totalSpendingChange: number
    topCategory: string
    biggestIncrease: string
    biggestDecrease: string
  }
}

interface InsightsCardProps {
  className?: string
}

export default function InsightsCard({ className }: InsightsCardProps) {
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInsights = async () => {
    setLoading(true)
    setError(null)
    setInsights(null)

    try {
      const response = await fetch('/api/insights')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate insights')
      }

      if (data.success) {
        setInsights(data.insights)
      } else {
        throw new Error(data.error || 'Failed to generate insights')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-500'
    if (change < 0) return 'text-green-500'
    return 'text-gray-500'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />
    if (change < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  return (
    <Card className={`border-border bg-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Brain className="w-6 h-6 text-primary" />
            </motion.div>
            <CardTitle className="text-xl font-semibold">AI Insights</CardTitle>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={generateInsights} 
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-12 h-12 text-primary opacity-50" />
              </motion.div>
              <p className="text-muted-foreground mt-4 text-center">
                Analyzing your spending patterns...
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}

          {insights && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Summary
                </h3>
                <p className="text-muted-foreground">{insights.summary}</p>
              </motion.div>

              {/* Key Metrics */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {getChangeIcon(insights.keyMetrics.totalSpendingChange)}
                    <span className="text-sm font-medium text-muted-foreground">Total Change</span>
                  </div>
                  <p className={`text-lg font-bold ${getChangeColor(insights.keyMetrics.totalSpendingChange)}`}>
                    {insights.keyMetrics.totalSpendingChange > 0 ? '+' : ''}{insights.keyMetrics.totalSpendingChange.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Top Category</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{insights.keyMetrics.topCategory}</p>
                </div>
              </motion.div>

              {/* Trends */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Key Trends
                </h3>
                <div className="space-y-2">
                  {insights.trends.map((trend, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-green-800 dark:text-green-200">{trend}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recommendations */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                    >
                      <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs">
                        {index + 1}
                      </Badge>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">{recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {!loading && !error && !insights && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Brain className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready for Insights</h3>
              <p className="text-muted-foreground mb-4">
                Get personalized analysis of your spending patterns and actionable recommendations.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}


