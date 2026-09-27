'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkoutContent, Exercise, ExercisePart, Intensity } from '@/lib/types'
import { parseSetsText } from '@/lib/exercise-parts'

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

const INPUT = 'bg-surface border border-line rounded-sm px-2.5 py-2 text-ink text-sm focus:outline-none focus:border-brand placeholder-faint'

// Losse oefeningen binnen een blok bewerken (ingeklapt, want wordt niet vaak gebruikt)
function PartsEditor({ exercise, onChange }: { exercise: Exercise; onChange: (updated: Exercise) => void }) {
  const parts: ExercisePart[] = exercise.onderdelen ?? []
  const [open, setOpen] = useState(false)
  const parsed = parts.length ? null : parseSetsText(exercise.duur_of_sets)

  function setParts(next: ExercisePart[]) {
    onChange({ ...exercise, onderdelen: next.length ? next : null })
  }
  function update(i: number, patch: Partial<ExercisePart>) {
    setParts(parts.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  }

  // Oude blokken (alles in één tekst) omzetten naar losse regels; de opzet per ronde gaat mee in het groepslabel
  function convertFromText() {
    if (!parsed) return
    const next: ExercisePart[] = parsed.flatMap((g) => {
      const groep = g.note ? null : [g.label, g.label ? g.opzet : null].filter(Boolean).join(' · ') || null
      if (g.note) return [{ groep: g.label, aantal: null, naam: g.items[0]?.naam ?? '' }]
      return g.items.map((it) => ({ groep, aantal: it.aantal, naam: it.detail ? `${it.naam} (${it.detail})` : it.naam }))
    })
    const opzet = parsed.length === 1 && !parsed[0].label ? parsed[0].opzet ?? '' : ''
    onChange({ ...exercise, onderdelen: next, duur_of_sets: opzet })
    setOpen(true)
  }

  if (!parts.length) {
    return parsed ? (
      <button onClick={convertFromText} className="w-full py-2 rounded-sm border border-line text-sm font-medium hover:border-ink transition-colors">
        Omzetten naar losse oefeningen ({parsed.reduce((n, g) => n + g.items.length, 0)})
      </button>
    ) : (
      <button
        onClick={() => { setParts([{ groep: null, aantal: '', naam: '' }]); setOpen(true) }}
        className="text-sm text-muted hover:text-ink underline underline-offset-2"
      >
        + Losse oefeningen toevoegen
      </button>
    )
  }

  return (
    <div className="border border-line rounded-sm">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium" aria-expanded={open}>
        <span>Oefeningen in dit blok ({parts.length})</span>
        <span aria-hidden="true" className="text-muted">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-line p-2 space-y-2">
          {parts.map((p, i) => (
            <div key={i} className="grid gap-1.5 pb-2 border-b border-line last:border-b-0" style={{ gridTemplateColumns: '4.5rem minmax(0,1fr) auto' }}>
              <input value={p.aantal ?? ''} onChange={(e) => update(i, { aantal: e.target.value })} placeholder="Aantal" aria-label="Aantal" className={INPUT} />
              <input value={p.naam} onChange={(e) => update(i, { naam: e.target.value })} placeholder="Oefening, bijv. push-ups" aria-label="Oefening" className={INPUT} />
              <button onClick={() => setParts(parts.filter((_, j) => j !== i))} className="text-red-700 hover:text-red-900 px-2" aria-label="Verwijder deze oefening">
                <span aria-hidden="true" className="text-lg leading-none">×</span>
              </button>
              <input
                value={p.groep ?? ''}
                onChange={(e) => update(i, { groep: e.target.value || null })}
                placeholder="Ronde of station (optioneel)"
                aria-label="Ronde of station"
                className={`${INPUT} text-xs py-1.5`}
                style={{ gridColumn: '1 / 3' }}
              />
            </div>
          ))}
          <button
            onClick={() => setParts([...parts, { groep: parts[parts.length - 1]?.groep ?? null, aantal: '', naam: '' }])}
            className="w-full py-2 border border-dashed border-line rounded-sm text-sm text-muted hover:text-ink hover:border-ink transition-colors"
          >
            + Oefening toevoegen
          </button>
          {exercise.duur_of_sets.length > 45 && (
            <p className="text-xs text-muted">Tip: maak &ldquo;Sets/tijd&rdquo; kort (bijv. &ldquo;3 rondes&rdquo;), anders staan de oefeningen er dubbel.</p>
          )}
        </div>
      )}
    </div>
  )
}

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
          className="flex-1 min-w-0 bg-void-input border border-void-border rounded-sm px-3 py-2 text-ink text-sm focus:outline-none focus:border-neon-400 placeholder-faint"
        />
        <input
          value={exercise.duur_of_sets}
          onChange={(e) => onChange({ ...exercise, duur_of_sets: e.target.value })}
          placeholder="Sets/tijd"
          className="w-24 min-w-0 bg-void-input border border-void-border rounded-sm px-3 py-2 text-ink text-sm focus:outline-none focus:border-neon-400 placeholder-faint"
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
      <PartsEditor exercise={exercise} onChange={onChange} />
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
