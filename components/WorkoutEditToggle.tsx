'use client'

import { useState } from 'react'
import WorkoutEditor from '@/components/WorkoutEditor'
import type { WorkoutContent, Intensity } from '@/lib/types'

interface WorkoutEditToggleProps {
  workoutId: string
  content: WorkoutContent
  intensity?: Intensity
  kneeFriendly?: boolean
  equipment?: string[]
}

export default function WorkoutEditToggle({ workoutId, content, intensity, kneeFriendly, equipment }: WorkoutEditToggleProps) {
  const [editMode, setEditMode] = useState(false)

  if (editMode) {
    return (
      <WorkoutEditor
        workoutId={workoutId}
        initialContent={content}
        intensity={intensity}
        kneeFriendly={kneeFriendly}
        equipment={equipment}
        onClose={() => setEditMode(false)}
      />
    )
  }

  return (
    <button
      onClick={() => setEditMode(true)}
      className="btn-secondary w-full"
    >
      Training bewerken
    </button>
  )
}
