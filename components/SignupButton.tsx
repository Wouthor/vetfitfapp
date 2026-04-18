'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SignupButtonProps {
  workoutId: string
  isSignedUp: boolean
}

export default function SignupButton({ workoutId, isSignedUp: initial }: SignupButtonProps) {
  const [isSignedUp, setIsSignedUp] = useState(initial)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setLoading(true)
    const method = isSignedUp ? 'DELETE' : 'POST'
    await fetch(`/api/workouts/${workoutId}/signup`, { method })
    setIsSignedUp(!isSignedUp)
    setLoading(false)
    router.refresh()
  }

  if (isSignedUp) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2 py-3 px-4 bg-void-card border border-magenta-500 rounded-xl">
          <span className="text-magenta-400 text-lg">✓</span>
          <p className="text-sm font-semibold text-magenta-400">Je doet mee!</p>
          <button
            onClick={handleToggle}
            disabled={loading}
            className="ml-auto text-xs text-[#ff99ff] hover:text-white"
          >
            {loading ? '...' : 'Afmelden'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-void-card border border-magenta-500 hover:bg-magenta-900/40 text-magenta-400 font-semibold rounded-xl transition-colors"
    >
      {loading ? 'Bezig...' : <><span>🏋️</span> Ik doe mee!</>}
    </button>
  )
}
