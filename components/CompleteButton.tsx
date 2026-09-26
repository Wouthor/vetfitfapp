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
    const res = await fetch(`/api/workouts/${workoutId}/complete`, { method: 'POST' })
    setLoading(false)
    if (!res.ok) return
    setDone(true)
    setDate(new Date().toISOString())
    router.refresh()
  }

  async function handleUndo() {
    setLoading(true)
    const res = await fetch(`/api/workouts/${workoutId}/complete`, { method: 'DELETE' })
    setLoading(false)
    if (!res.ok) return
    setDone(false)
    setDate(null)
    router.refresh()
  }

  if (done && date) {
    return (
      <div className="flex items-center py-3 px-4 bg-blush rounded-sm">
        <div>
          <p className="font-label font-bold text-sm uppercase tracking-wider text-berry">Training gedaan</p>
          <p className="text-xs text-berry">
            {new Date(date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={handleUndo}
          disabled={loading}
          className="ml-auto font-label font-bold text-xs uppercase tracking-widest text-berry hover:text-ink disabled:opacity-50"
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
      className="btn-secondary w-full"
    >
      {loading ? 'Bezig…' : 'Markeer als gedaan'}
    </button>
  )
}
