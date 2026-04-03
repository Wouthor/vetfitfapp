'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PublishButton({ workoutId }: { workoutId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePublish() {
    setLoading(true)
    await fetch(`/api/workouts/${workoutId}/publish`, { method: 'POST' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={handlePublish} disabled={loading} className="btn-primary flex-1">
      {loading ? 'Bezig...' : 'Publiceren'}
    </button>
  )
}
