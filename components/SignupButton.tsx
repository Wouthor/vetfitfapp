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
        <div className="flex items-center py-3 px-4 bg-blush rounded-sm">
          <p className="font-label font-bold text-sm uppercase tracking-wider">✓ Je doet mee</p>
          <button
            onClick={handleToggle}
            disabled={loading}
            className="ml-auto font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink"
          >
            {loading ? 'Bezig…' : 'Afmelden'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="btn-primary w-full"
    >
      {loading ? 'Bezig...' : 'Ik doe mee'}
    </button>
  )
}
