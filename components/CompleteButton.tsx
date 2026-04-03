'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CompleteButtonProps {
  workoutId: string
  completedAt: string | null
}

export default function CompleteButton({ workoutId, completedAt }: CompleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(!!completedAt)
  const [date, setDate] = useState<string | null>(completedAt)
  const router = useRouter()

  async function handleComplete() {
    setLoading(true)
    await fetch(`/api/workouts/${workoutId}/complete`, { method: 'POST' })
    const now = new Date().toISOString()
    setDone(true)
    setDate(now)
    setLoading(false)
    router.refresh()
  }

  if (done && date) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-void-card border border-green-700 rounded-xl">
        <span className="text-green-400">✓</span>
        <div>
          <p className="text-sm font-semibold text-green-400">Training gedaan</p>
          <p className="text-xs text-green-600">
            {new Date(date).toLocaleDateString('nl-NL', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            })}
          </p>
        </div>
        <button
          onClick={() => { setDone(false); setDate(null) }}
          className="ml-auto text-xs text-gray-500 hover:text-gray-400"
        >
          Ongedaan maken
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-void-card border border-green-700 hover:bg-green-900/40 text-green-400 font-semibold rounded-xl transition-colors"
    >
      {loading ? 'Bezig...' : <><span>✓</span> Training gedaan</>}
    </button>
  )
}
