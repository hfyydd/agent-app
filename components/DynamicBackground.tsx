'use client'

import { useEffect, useState, useMemo } from 'react'

const TOTAL_CIRCLES = 20

export default function DynamicBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const circles = useMemo(() => {
    return [...Array(TOTAL_CIRCLES)].map((_, i) => ({
      id: i,
      size: Math.random() * 200 + 50,
      x: Math.random() * 200 - 50,
      y: Math.random() * 200 - 50,
      animationDuration: Math.random() * 30 + 20,
      animationDelay: Math.random() * 10,
    }))
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
      {circles.map((circle) => (
        <div
          key={circle.id}
          className="absolute rounded-full bg-gray-900 dark:bg-gray-100 opacity-20 blur-xl animate-float-large"
          style={{
            width: `${circle.size}px`,
            height: `${circle.size}px`,
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            animationDuration: `${circle.animationDuration}s`,
            animationDelay: `${circle.animationDelay}s`,
          }}
        />
      ))}
    </div>
  )
}
