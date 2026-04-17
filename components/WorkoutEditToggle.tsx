'use client'

import { useState } from 'react'
import WorkoutEditor from '@/components/WorkoutEditor'
import type { WorkoutContent } from '@/lib/types'

interface WorkoutEditToggleProps {
  workoutId: string
  content: WorkoutContent
}

export default function WorkoutEditToggle({ workoutId, content }: WorkoutEditToggleProps) {
  const [editMode, setEditMode] = useState(false)

  if (editMode) {
    return (
      <WorkoutEditor
        workoutId={workoutId}
        initialContent={content}
        onClose={() => setEditMode(false)}
      />
    )
  }

  return (
    <button
      onClick={() => setEditMode(true)}
      className="btn-ghost text-sm"
    >
      ✏️ Bewerken
    </button>
  )
}
