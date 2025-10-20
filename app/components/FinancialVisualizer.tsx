'use client'

import { memo, useMemo } from 'react'

interface FinancialVisualizerProps {
  variant?: 'flow' | 'particles' | 'grid'
  className?: string
}

function FinancialVisualizerBase({ variant = 'flow', className }: FinancialVisualizerProps) {
  if (variant === 'flow') {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-900/40 ${className || ''}`}>
        <div className="pointer-events-none absolute inset-0 opacity-40">
          {/* flowing lines */}
          <div className="absolute top-1/4 h-px w-2/3 bg-gradient-to-r from-transparent via-teal-500/40 to-transparent animate-flow-x" />
          <div className="absolute top-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-flow-x" style={{ animationDelay: '1s' }} />
          <div className="absolute top-3/4 h-px w-3/4 bg-gradient-to-r from-transparent via-teal-400/30 to-transparent animate-flow-x" style={{ animationDelay: '2s' }} />
        </div>
        <div className="p-4 sm:p-6">
          <div className="text-sm text-gray-400">Financial flow</div>
          <div className="mt-1 text-xs text-gray-500">Live market-like movement</div>
        </div>
      </div>
    )
  }

  if (variant === 'particles') {
    const particles = useMemo(() => Array.from({ length: 10 }), [])
    return (
      <div className={`relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 ${className || ''}`}>
        <div className="pointer-events-none absolute inset-0">
          {particles.map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-teal-400/60 animate-float-up"
              style={{
                left: `${10 + (i * 8) % 80}%`,
                top: `${20 + (i * 7) % 60}%`,
                animationDelay: `${(i % 5) * 0.6}s`,
              }}
            />
          ))}
        </div>
        <div className="p-4 sm:p-6">
          <div className="text-sm text-gray-400">Signals</div>
          <div className="mt-1 text-xs text-gray-500">Subtle indicators of growth</div>
        </div>
      </div>
    )
  }

  // grid variant
  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-900/40 ${className || ''}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(32,32,32,0.25)_0,transparent_60%)]" />
      <div className="p-4 sm:p-6">
        <div className="text-sm text-gray-400">Market grid</div>
        <div className="mt-1 text-xs text-gray-500">Quiet background pulse</div>
      </div>
    </div>
  )
}

const FinancialVisualizer = memo(FinancialVisualizerBase)
export default FinancialVisualizer


