'use client'

import { useEffect, useRef, useState } from 'react'

interface FinancialVisualizerProps {
  variant?: 'flowing-lines' | 'particles' | 'grid-pulse'
  className?: string
}

export default function FinancialVisualizer({ 
  variant = 'flowing-lines', 
  className = '' 
}: FinancialVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    canvas.style.width = `${dimensions.width}px`
    canvas.style.height = `${dimensions.height}px`
    ctx.scale(dpr, dpr)

    let animationId: number
    let time = 0
    let lastTime = 0

    const animate = (currentTime: number) => {
      // Throttle to 30fps for better performance
      if (currentTime - lastTime < 33) {
        animationId = requestAnimationFrame(animate)
        return
      }
      lastTime = currentTime

      ctx.clearRect(0, 0, dimensions.width, dimensions.height)
      time += 0.016

      switch (variant) {
        case 'flowing-lines':
          drawFlowingLines(ctx, dimensions.width, dimensions.height, time)
          break
        case 'particles':
          drawParticles(ctx, dimensions.width, dimensions.height, time)
          break
        case 'grid-pulse':
          drawGridPulse(ctx, dimensions.width, dimensions.height, time)
          break
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [dimensions, variant])

  const drawFlowingLines = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const numLines = 3
    const lineHeight = 2
    const speed = 0.5

    for (let i = 0; i < numLines; i++) {
      const y = (height / (numLines + 1)) * (i + 1)
      const offset = (time * speed * 50 + i * 100) % (width + 200)
      const x = offset - 100

      // Create gradient for glowing effect
      const gradient = ctx.createLinearGradient(x, y, x + 200, y)
      gradient.addColorStop(0, 'rgba(20, 184, 166, 0)')
      gradient.addColorStop(0.3, 'rgba(20, 184, 166, 0.3)')
      gradient.addColorStop(0.5, 'rgba(20, 184, 166, 0.6)')
      gradient.addColorStop(0.7, 'rgba(20, 184, 166, 0.3)')
      gradient.addColorStop(1, 'rgba(20, 184, 166, 0)')

      ctx.fillStyle = gradient
      ctx.fillRect(x, y - lineHeight / 2, 200, lineHeight)
    }
  }

  const drawParticles = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const numParticles = 8
    const particleSize = 2

    for (let i = 0; i < numParticles; i++) {
      const baseX = (width / numParticles) * i
      const baseY = height * 0.8
      const offsetX = Math.sin(time * 0.5 + i) * 20
      const offsetY = Math.sin(time * 0.3 + i * 0.7) * 30 - time * 10
      const x = baseX + offsetX
      const y = baseY + offsetY

      // Wrap around screen
      const finalY = y < -particleSize ? height + particleSize : y

      const opacity = Math.max(0, 0.4 - Math.abs(offsetY) / 100)
      
      ctx.fillStyle = `rgba(20, 184, 166, ${opacity})`
      ctx.beginPath()
      ctx.arc(x, finalY, particleSize, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawGridPulse = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const gridSize = 40
    const cols = Math.ceil(width / gridSize)
    const rows = Math.ceil(height / gridSize)

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = col * gridSize
        const y = row * gridSize
        const distance = Math.sqrt(Math.pow(col - cols/2, 2) + Math.pow(row - rows/2, 2))
        const pulse = Math.sin(time * 2 - distance * 0.3) * 0.5 + 0.5
        const opacity = pulse * 0.1

        ctx.fillStyle = `rgba(20, 184, 166, ${opacity})`
        ctx.fillRect(x, y, gridSize - 1, gridSize - 1)
      }
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          background: 'transparent',
          pointerEvents: 'none'
        }}
      />
      {/* Fallback content for when canvas is not supported */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-8 h-8 border-2 border-teal-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}

// Static version for better performance on mobile
export function StaticFinancialVisualizer({ 
  variant = 'flowing-lines', 
  className = '' 
}: FinancialVisualizerProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {variant === 'flowing-lines' && (
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400/30 to-transparent animate-flow-x"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400/20 to-transparent animate-flow-x" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400/25 to-transparent animate-flow-x" style={{ animationDelay: '4s' }}></div>
        </div>
      )}
      
      {variant === 'particles' && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-teal-400/40 rounded-full animate-float-up"
              style={{
                left: `${20 + i * 15}%`,
                bottom: '20%',
                animationDelay: `${i * 0.5}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>
      )}
      
      {variant === 'grid-pulse' && (
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-1 p-2">
          {[...Array(48)].map((_, i) => (
            <div
              key={i}
              className="bg-teal-400/10 rounded-sm animate-subtle-pulse"
              style={{
                animationDelay: `${(i % 8) * 0.1}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}