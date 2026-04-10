'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StarRatingProps {
  workoutId: string
  initialRating: number | null
  initialComment: string | null
}

export default function StarRating({ workoutId, initialRating, initialComment }: StarRatingProps) {
  const [rating, setRating] = useState<number | null>(initialRating)
  const [hovered, setHovered] = useState<number | null>(null)
  const [comment, setComment] = useState(initialComment ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(!!initialRating)
  const router = useRouter()

  async function handleRate(stars: number) {
    if (loading) return
    setRating(stars)
    setSaved(false)
  }

  async function handleSave() {
    if (!rating || loading) return
    setLoading(true)
    await fetch(`/api/workouts/${workoutId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment: comment.trim() || null }),
    })
    setSaved(true)
    setLoading(false)
    router.refresh()
  }

  const display = hovered ?? rating ?? 0

  return (
    <div className="card space-y-3">
      <p className="text-sm font-semibold text-white">
        {saved ? 'Jouw beoordeling' : 'Beoordeel deze training'}
      </p>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className="text-3xl transition-transform hover:scale-110"
          >
            <span className={star <= display ? 'text-neon-400' : 'text-void-input'}>★</span>
          </button>
        ))}
      </div>

      {rating && (
        <>
          <textarea
            value={comment}
            onChange={(e) => { setComment(e.target.value); setSaved(false) }}
            placeholder="Optioneel: te zwaar, te veel rennen, leuke oefening... (max 300 tekens)"
            maxLength={300}
            rows={3}
            className="w-full bg-void-input border border-void-border rounded-xl px-4 py-3 text-white placeholder-[#4a5e8a] text-sm focus:outline-none focus:ring-2 focus:ring-magenta-500 resize-none"
          />

          {!saved && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary w-full py-2 text-sm"
            >
              {loading ? 'Opslaan...' : 'Beoordeling opslaan'}
            </button>
          )}

          {saved && (
            <p className="text-xs text-[#ff99ff]">
              {rating === 5 ? 'Geweldig! 🔥' :
               rating === 4 ? 'Top training 💪' :
               rating === 3 ? 'Goed gedaan 👍' :
               rating === 2 ? 'Kon beter 😅' :
                              'Zwaar... 😰'}
              {' '}
              <button onClick={() => setSaved(false)} className="underline opacity-60 hover:opacity-100">
                Aanpassen
              </button>
            </p>
          )}
        </>
      )}
    </div>
  )
}
