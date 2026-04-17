'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkoutContent, Exercise } from '@/lib/types'

interface WorkoutEditorProps {
  workoutId: string
  initialContent: WorkoutContent
  onClose: () => void
}

const sectionConfig = {
  warming_up: {
    label: 'Warming-up',
    accent: 'text-neon-400',
    border: 'border-neon-400/30',
  },
  hoofddeel: {
    label: 'Hoofddeel',
    accent: 'text-magenta-400',
    border: 'border-magenta-500/30',
  },
  cooling_down: {
    label: 'Cooling-down',
    accent: 'text-electric-400',
    border: 'border-electric-400/30',
  },
} as const

type SectionKey = keyof typeof sectionConfig

function ExerciseEditor({
  exercise,
  onChange,
  onRemove,
}: {
  exercise: Exercise
  onChange: (updated: Exercise) => void
  onRemove: () => void
}) {
  return (
    <div className="bg-void-input border border-void-border rounded-xl p-4 space-y-3">
      <div className="flex gap-2 items-start">
        <input
          value={exercise.naam}
          onChange={(e) => onChange({ ...exercise, naam: e.target.value })}
          placeholder="Naam oefening"
          className="flex-1 bg-void-input border border-void-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-magenta-500 placeholder-gray-500"
        />
        <input
          value={exercise.duur_of_sets}
          onChange={(e) => onChange({ ...exercise, duur_of_sets: e.target.value })}
          placeholder="Sets/tijd"
          className="w-28 bg-void-input border border-void-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-magenta-500 placeholder-gray-500"
        />
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 px-2 py-2 flex-shrink-0 transition-colors"
          title="Verwijder oefening"
        >
          🗑️
        </button>
      </div>
      <textarea
        value={exercise.beschrijving}
        onChange={(e) => onChange({ ...exercise, beschrijving: e.target.value })}
        placeholder="Beschrijving"
        rows={2}
        className="w-full bg-void-input border border-void-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-magenta-500 placeholder-gray-500 resize-none"
      />
      <input
        value={exercise.knie_vriendelijk_alternatief}
        onChange={(e) => onChange({ ...exercise, knie_vriendelijk_alternatief: e.target.value })}
        placeholder="Knie-vriendelijk alternatief"
        className="w-full bg-void-input border border-void-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-magenta-500 placeholder-gray-500"
      />
    </div>
  )
}

export default function WorkoutEditor({ workoutId, initialContent, onClose }: WorkoutEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState<WorkoutContent>(initialContent)
  const [saving, setSaving] = useState(false)

  function updateExercise(section: SectionKey, index: number, updated: Exercise) {
    const oefeningen = [...content[section].oefeningen]
    oefeningen[index] = updated
    setContent({ ...content, [section]: { ...content[section], oefeningen } })
  }

  function removeExercise(section: SectionKey, index: number) {
    const oefeningen = content[section].oefeningen.filter((_, i) => i !== index)
    setContent({ ...content, [section]: { ...content[section], oefeningen } })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/workouts/${workoutId}/content`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Er ging iets mis bij het opslaan.')
        return
      }
      onClose()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {(Object.keys(sectionConfig) as SectionKey[]).map((key) => {
        const cfg = sectionConfig[key]
        const section = content[key]
        return (
          <div key={key} className={`card border ${cfg.border} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-base ${cfg.accent}`}>{cfg.label}</h3>
              <input
                value={section.duur}
                onChange={(e) =>
                  setContent({ ...content, [key]: { ...section, duur: e.target.value } })
                }
                placeholder="Duur"
                className="w-36 bg-void-input border border-void-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-magenta-500 placeholder-gray-500"
              />
            </div>
            <div className="space-y-3">
              {section.oefeningen.map((ex, i) => (
                <ExerciseEditor
                  key={i}
                  exercise={ex}
                  onChange={(updated) => updateExercise(key, i, updated)}
                  onRemove={() => removeExercise(key, i)}
                />
              ))}
            </div>
            <button
              onClick={() =>
                setContent({
                  ...content,
                  [key]: {
                    ...section,
                    oefeningen: [
                      ...section.oefeningen,
                      { naam: '', beschrijving: '', duur_of_sets: '', knie_vriendelijk_alternatief: '' },
                    ],
                  },
                })
              }
              className="w-full py-2 border border-dashed border-void-border text-gray-400 hover:text-white hover:border-gray-400 rounded-xl text-sm transition-colors"
            >
              + Oefening toevoegen
            </button>
          </div>
        )
      })}

      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">
          Annuleren
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
          {saving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </div>
    </div>
  )
}
