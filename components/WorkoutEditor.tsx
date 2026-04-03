'use client'

import { useState } from 'react'
import type { WorkoutContent, WorkoutSection, Exercise } from '@/lib/types'

interface WorkoutEditorProps {
  workout: WorkoutContent
  onSave: (updated: WorkoutContent) => void
  onCancel: () => void
  saving: boolean
}

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
    <div className="bg-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex gap-2">
        <input
          value={exercise.naam}
          onChange={(e) => onChange({ ...exercise, naam: e.target.value })}
          placeholder="Naam oefening"
          className="input flex-1 text-sm py-2"
        />
        <input
          value={exercise.duur_of_sets}
          onChange={(e) => onChange({ ...exercise, duur_of_sets: e.target.value })}
          placeholder="Sets/tijd"
          className="input w-28 text-sm py-2"
        />
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 px-2 flex-shrink-0"
          title="Verwijder oefening"
        >
          ✕
        </button>
      </div>
      <textarea
        value={exercise.beschrijving}
        onChange={(e) => onChange({ ...exercise, beschrijving: e.target.value })}
        placeholder="Beschrijving"
        rows={2}
        className="input text-sm py-2 resize-none"
      />
      <input
        value={exercise.knie_vriendelijk_alternatief}
        onChange={(e) => onChange({ ...exercise, knie_vriendelijk_alternatief: e.target.value })}
        placeholder="Knie-vriendelijk alternatief"
        className="input text-sm py-2"
      />
    </div>
  )
}

function SectionEditor({
  title,
  section,
  onChange,
}: {
  title: string
  section: WorkoutSection
  onChange: (updated: WorkoutSection) => void
}) {
  function updateExercise(index: number, updated: Exercise) {
    const oefeningen = [...section.oefeningen]
    oefeningen[index] = updated
    onChange({ ...section, oefeningen })
  }

  function removeExercise(index: number) {
    const oefeningen = section.oefeningen.filter((_, i) => i !== index)
    onChange({ ...section, oefeningen })
  }

  function addExercise() {
    onChange({
      ...section,
      oefeningen: [
        ...section.oefeningen,
        { naam: '', beschrijving: '', duur_of_sets: '', knie_vriendelijk_alternatief: '' },
      ],
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">{title}</h3>
        <input
          value={section.duur}
          onChange={(e) => onChange({ ...section, duur: e.target.value })}
          className="input w-36 text-sm py-1.5"
          placeholder="Duur"
        />
      </div>
      <div className="space-y-2">
        {section.oefeningen.map((ex, i) => (
          <ExerciseEditor
            key={i}
            exercise={ex}
            onChange={(updated) => updateExercise(i, updated)}
            onRemove={() => removeExercise(i)}
          />
        ))}
      </div>
      <button
        onClick={addExercise}
        className="w-full py-2 border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded-xl text-sm transition-colors"
      >
        + Oefening toevoegen
      </button>
    </div>
  )
}

export default function WorkoutEditor({ workout, onSave, onCancel, saving }: WorkoutEditorProps) {
  const [edited, setEdited] = useState<WorkoutContent>(workout)

  return (
    <div className="space-y-6">
      <div className="card bg-gray-900 border-gray-700">
        <SectionEditor
          title="🔥 Warming-up"
          section={edited.warming_up}
          onChange={(s) => setEdited({ ...edited, warming_up: s })}
        />
      </div>

      <div className="card bg-gray-900 border-gray-700">
        <SectionEditor
          title="💪 Hoofddeel"
          section={edited.hoofddeel}
          onChange={(s) => setEdited({ ...edited, hoofddeel: s })}
        />
      </div>

      <div className="card bg-gray-900 border-gray-700">
        <SectionEditor
          title="❄️ Cooling-down"
          section={edited.cooling_down}
          onChange={(s) => setEdited({ ...edited, cooling_down: s })}
        />
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Annuleren
        </button>
        <button
          onClick={() => onSave(edited)}
          disabled={saving}
          className="btn-primary flex-1"
        >
          {saving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </div>
    </div>
  )
}
