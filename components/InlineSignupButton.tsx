'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface InlineSignupButtonProps {
  workoutId: string
  isSignedUp: boolean
  count: number
}

export default function InlineSignupButton({ workoutId, isSignedUp: initial, count: initialCount }: InlineSignupButtonProps) {
  const [isSignedUp, setIsSignedUp] = useState(initial)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    const method = isSignedUp ? 'DELETE' : 'POST'
    await fetch(`/api/workouts/${workoutId}/signup`, { method })
    setIsSignedUp(!isSignedUp)
    setCount(isSignedUp ? count - 1 : count + 1)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`mt-2 w-full py-2 rounded-xl text-sm font-semibold transition-colors border ${
        isSignedUp
          ? 'bg-magenta-900/50 border-magenta-500 text-magenta-400 hover:bg-magenta-900/80'
          : 'bg-void-input border-void-border text-[#ff99ff] hover:border-magenta-500 hover:text-magenta-400'
      }`}
    >
      {loading ? '...' : isSignedUp
        ? `✓ Jij doet mee${count > 1 ? ` · ${count} deelnemers` : ''}`
        : `🏋️ Ik doe mee${count > 0 ? ` · ${count} doen al mee` : ''}`
      }
    </button>
  )
}
