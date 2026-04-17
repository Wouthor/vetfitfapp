'use client'

import { useState, useRef } from 'react'
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
  const [savingRating, setSavingRating] = useState(false)
  const [savingComment, setSavingComment] = useState(false)
  const [commentSaved, setCommentSaved] = useState(!!initialComment)
  const [ratingJustSaved, setRatingJustSaved] = useState(false)
  const commentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  async function handleRate(stars: number) {
    if (savingRating || stars === rating) return
    setSavingRating(true)
    setRating(stars)
    setCommentSaved(false)

    await fetch(`/api/workouts/${workoutId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: stars, comment: comment.trim() || null }),
    })

    setSavingRating(false)
    setRatingJustSaved(true)
    setTimeout(() => setRatingJustSaved(false), 2000)
    router.refresh()
  }

  async function handleCommentChange(value: string) {
    setComment(value)
    setCommentSaved(false)

    // Auto-opslaan na 1.5s stilstaan
    if (commentTimer.current) clearTimeout(commentTimer.current)
    if (!rating) return
    commentTimer.current = setTimeout(async () => {
      setSavingComment(true)
      await fetch(`/api/workouts/${workoutId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: value.trim() || null }),
      })
      setSavingComment(false)
      setCommentSaved(true)
      router.refresh()
    }, 1500)
  }

  const display = hovered ?? rating ?? 0

  const ratingLabel =
    rating === 5 ? 'Geweldig! 🔥' :
    rating === 4 ? 'Top training 💪' :
    rating === 3 ? 'Goed gedaan 👍' :
    rating === 2 ? 'Kon beter 😅' :
    rating === 1 ? 'Zwaar... 😰' : ''

  return (
    <div className="card space-y-3">
      <p className="text-sm font-semibold text-white">Beoordeel deze training</p>

      {/* Sterren */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            disabled={savingRating}
            className="text-3xl transition-transform hover:scale-110 disabled:opacity-50"
          >
            <span className={star <= display ? 'text-neon-400' : 'text-void-input'}>★</span>
          </button>
        ))}

        {/* Status naast de sterren */}
        <span className="ml-2 text-xs">
          {savingRating && <span className="text-[#ff99ff] animate-pulse">Opslaan...</span>}
          {!savingRating && ratingJustSaved && <span className="text-green-400">✓ Opgeslagen</span>}
          {!savingRating && !ratingJustSaved && rating && <span className="text-[#ff99ff]">{ratingLabel}</span>}
        </span>
      </div>

      {/* Commentaar — alleen zichtbaar na het geven van een rating */}
      {rating && (
        <div className="space-y-1.5">
          <textarea
            value={comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder="Optioneel: bijv. te zwaar, te veel rennen, leuke oefening..."
            maxLength={300}
            rows={2}
            className="w-full bg-void-input border border-void-border rounded-xl px-4 py-3 text-white placeholder-[#4a5e8a] text-sm focus:outline-none focus:ring-2 focus:ring-magenta-500 resize-none"
          />
          <p className="text-xs text-right">
            {savingComment && <span className="text-[#ff99ff] animate-pulse">Opslaan...</span>}
            {!savingComment && commentSaved && <span className="text-green-400">✓ Opgeslagen</span>}
            {!savingComment && !commentSaved && comment && <span className="text-[#ff99ff] opacity-50">Wordt opgeslagen...</span>}
          </p>
        </div>
      )}
    </div>
  )
}
