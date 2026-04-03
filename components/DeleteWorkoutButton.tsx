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
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
        >
          {loading ? 'Bezig...' : 'Ja, verwijderen'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 py-2.5 rounded-xl bg-void-input hover:bg-void-border text-[#7b8db8] font-semibold text-sm transition-colors border border-void-border"
        >
          Annuleren
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="w-full py-2.5 rounded-xl border border-red-800/50 hover:bg-red-900/30 text-red-500 font-semibold text-sm transition-colors"
    >
      🗑 Training verwijderen
    </button>
  )
}
