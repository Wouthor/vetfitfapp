'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SwipeToDeleteProps {
  workoutId: string
  name: string
  // Live trainingen zien sporters: daar eerst even vragen
  confirmFirst?: boolean
  // Achtergrond van de rij, zodat de rode knop er niet doorheen schijnt
  className?: string
  children: React.ReactNode
}

const BUTTON_WIDTH = 104
const OPEN_EVENT = 'swipe-to-delete-open'

// Rij die je naar links veegt; dan verschijnt rechts een rode knop "Verwijderen"
export default function SwipeToDelete({ workoutId, name, confirmFirst, className = '', children }: SwipeToDeleteProps) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [gone, setGone] = useState(false)
  const router = useRouter()

  const startX = useRef(0)
  const startY = useRef(0)
  const startOffset = useRef(0)
  const direction = useRef<'none' | 'x' | 'y'>('none')
  const moved = useRef(false)
  const active = useRef(false)

  // Maar één rij tegelijk open
  useEffect(() => {
    function onOtherOpen(e: Event) {
      if ((e as CustomEvent).detail !== workoutId) setOffset(0)
    }
    window.addEventListener(OPEN_EVENT, onOtherOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOtherOpen)
  }, [workoutId])

  function begin(x: number, y: number) {
    active.current = true
    startX.current = x
    startY.current = y
    startOffset.current = offset
    direction.current = 'none'
    moved.current = false
  }

  function move(x: number, y: number) {
    if (!active.current) return
    const dx = x - startX.current
    const dy = y - startY.current
    if (direction.current === 'none') {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      direction.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }
    if (direction.current !== 'x') return
    moved.current = true
    setDragging(true)
    setOffset(Math.max(-BUTTON_WIDTH - 24, Math.min(0, startOffset.current + dx)))
  }

  function end() {
    if (!active.current) return
    active.current = false
    setDragging(false)
    if (direction.current !== 'x') return
    const open = offset < -BUTTON_WIDTH / 2
    setOffset(open ? -BUTTON_WIDTH : 0)
    if (open) window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: workoutId }))
  }

  // Na vegen of als de rij open staat: niet doorklikken naar de training, maar dichtschuiven
  function onClickCapture(e: React.MouseEvent) {
    if (moved.current || offset !== 0) {
      e.preventDefault()
      e.stopPropagation()
      if (!moved.current) setOffset(0)
      moved.current = false
    }
  }

  async function handleDelete() {
    if (confirmFirst && !window.confirm(`"${name}" staat live. Toch verwijderen?`)) {
      setOffset(0)
      return
    }
    setDeleting(true)
    const res = await fetch(`/api/workouts/${workoutId}`, { method: 'DELETE' })
    if (!res.ok) {
      setDeleting(false)
      setOffset(0)
      window.alert('Verwijderen is niet gelukt. Probeer het nog eens.')
      return
    }
    setGone(true)
    router.refresh()
  }

  if (gone) return null

  return (
    <div className="relative overflow-hidden rounded-sm">
      <div className="absolute top-0 right-0 bottom-0 flex items-stretch" style={{ width: BUTTON_WIDTH }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          tabIndex={offset === 0 ? -1 : 0}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-label font-bold text-xs uppercase tracking-widest disabled:opacity-60"
        >
          {deleting ? 'Bezig…' : 'Verwijderen'}
        </button>
      </div>
      <div
        className={`relative ${className}`}
        style={{
          transform: `translateX(${offset}px)`,
          WebkitTransform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={(e) => begin(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => move(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={end}
        onTouchCancel={end}
        onMouseDown={(e) => begin(e.clientX, e.clientY)}
        onMouseMove={(e) => move(e.clientX, e.clientY)}
        onMouseUp={end}
        onMouseLeave={end}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {children}
      </div>
    </div>
  )
}
