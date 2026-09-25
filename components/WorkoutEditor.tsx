'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkoutContent, Exercise, Intensity } from '@/lib/types'

interface WorkoutEditorProps {
  workoutId: string
  initialContent: WorkoutContent
  intensity?: Intensity
  kneeFriendly?: boolean
  equipment?: string[]
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
    accent: 'text-neon-400',
    border: 'border-neon-400/30',
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
  sectionLabel,
  intensity,
  kneeFriendly,
  equipment,
  onChange,
  onRemove,
}: {
  exercise: Exercise
  sectionLabel: string
  intensity: Intensity
  kneeFriendly: boolean
  equipment: string[]
  onChange: (updated: Exercise) => void
  onRemove: () => void
}) {
  const [replacing, setReplacing] = useState(false)
  const [error, setError] = useState('')

  async function handleReplace() {
    setReplacing(true)
    setError('')
    try {
      const res = await fetch('/api/generate/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionLabel, currentExercise: exercise, equipment, kneeFriendly, intensity }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Genereren mislukt')
        return
      }
      onChange(data.exercise)
    } catch {
      setError('Genereren mislukt')
    } finally {
      setReplacing(false)
    }
  }

  return (
    <div className="bg-void-input border border-void-border rounded-sm p-4 space-y-3">
      <div className="flex space-x-2 items-start">
        <input
          value={exercise.naam}
          onChange={(e) => onChange({ ...exercise, naam: e.target.value })}
          placeholder="Naam oefening"
          className="flex-1 bg-void-input border border-void-border rounded-sm px-3 py-2 text-ink text-sm focus:outline-none focus:border-neon-400 placeholder-faint"
        />
        <input
          value={exercise.duur_of_sets}
          onChange={(e) => onChange({ ...exercise, duur_of_sets: e.target.value })}
          placeholder="Sets/tijd"
          className="w-28 bg-void-input border border-void-border rounded-sm px-3 py-2 text-ink text-sm focus:outline-none focus:border-neon-400 placeholder-faint"
        />
        <button
          onClick={onRemove}
          className="text-red-700 hover:text-red-900 px-2 py-2 flex-shrink-0 transition-colors"
          title="Verwijder oefening"
          aria-label="Verwijder oefening"
        >
          <span aria-hidden="true" className="text-xl leading-none">×</span>
        </button>
      </div>
      <textarea
        value={exercise.beschrijving}
        onChange={(e) => onChange({ ...exercise, beschrijving: e.target.value })}
        placeholder="Beschrijving"
        rows={2}
        className="w-full bg-void-input border border-void-border rounded-sm px-3 py-2 text-ink text-sm focus:outline-none focus:border-neon-400 placeholder-faint resize-none"
      />
      <input
        value={exercise.knie_vriendelijk_alternatief}
        onChange={(e) => onChange({ ...exercise, knie_vriendelijk_alternatief: e.target.value })}
        placeholder="Knie-vriendelijk alternatief"
        className="w-full bg-void-input border border-void-border rounded-sm px-3 py-2 text-ink text-sm focus:outline-none focus:border-neon-400 placeholder-faint"
      />
      <button
        onClick={handleReplace}
        disabled={replacing}
        className="w-full py-2 rounded-sm border border-neon-400/40 text-neon-400 text-sm font-medium hover:bg-neon-400/10 transition-colors disabled:opacity-50"
      >
        {replacing ? 'Bezig met genereren...' : 'Vervang met AI'}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  )
}

export default function WorkoutEditor({ workoutId, initialContent, intensity = 'middel', kneeFriendly = false, equipment = [], onClose }: WorkoutEditorProps) {
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
                className="w-36 bg-void-input border border-void-border rounded-sm px-3 py-1.5 text-ink text-sm focus:outline-none focus:border-neon-400 placeholder-faint"
              />
            </div>
            <div className="space-y-3">
              {section.oefeningen.map((ex, i) => (
                <ExerciseEditor
                  key={i}
                  exercise={ex}
                  sectionLabel={cfg.label}
                  intensity={intensity}
                  kneeFriendly={kneeFriendly}
                  equipment={equipment}
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
              className="w-full py-2 border border-dashed border-void-border text-muted hover:text-ink hover:border-gray-400 rounded-sm text-sm transition-colors"
            >
              + Oefening toevoegen
            </button>
          </div>
        )
      })}

      <div className="flex space-x-3">
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
