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
      className={`w-full py-2.5 rounded-sm font-label font-bold text-sm uppercase tracking-wider transition-colors border-2 ${
        isSignedUp
          ? 'bg-brand border-brand text-white hover:bg-brand-dark'
          : 'bg-transparent border-ink text-ink hover:bg-sunken'
      }`}
    >
      {loading ? 'Bezig…' : isSignedUp
        ? `✓ Je doet mee${count > 1 ? ` · ${count} deelnemers` : ''}`
        : `Ik doe mee${count > 0 ? ` · ${count} al aangemeld` : ''}`
      }
    </button>
  )
}
