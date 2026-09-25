'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteWorkoutButton({ workoutId }: { workoutId: string }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/workouts/${workoutId}`, { method: 'DELETE' })
    router.push('/instructor')
    router.refresh()
  }

  if (confirm) {
    return (
      <div className="flex space-x-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 py-2.5 rounded-sm bg-red-700 hover:bg-red-800 text-white font-label font-bold uppercase tracking-wider text-sm transition-colors"
        >
          {loading ? 'Bezig...' : 'Ja, verwijderen'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 py-2.5 rounded-sm bg-transparent hover:bg-sunken text-ink font-label font-bold uppercase tracking-wider text-sm transition-colors border-2 border-ink"
        >
          Annuleren
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="w-full py-2.5 rounded-sm font-label font-bold text-xs uppercase tracking-widest text-red-700 hover:bg-red-50 transition-colors"
    >
      Training verwijderen
    </button>
  )
}
