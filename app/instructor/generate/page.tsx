'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Duration, Intensity, WorkoutContent } from '@/lib/types'
import WorkoutDisplay from '@/components/WorkoutDisplay'
import WorkoutEditor from '@/components/WorkoutEditor'
import PDFExportButton from '@/components/PDFExportButton'
import EquipmentPicker from '@/components/EquipmentPicker'
import ChatFitInput from '@/components/ChatFitInput'
import { createClient } from '@/lib/supabase/client'

export default function GeneratePage() {
  const [duration, setDuration] = useState<Duration>(60)
  const [intensity, setIntensity] = useState<Intensity>('middel')
  const [kneeFriendly, setKneeFriendly] = useState(false)
  const [equipment, setEquipment] = useState<string[]>([])
  const [chatfit, setChatfit] = useState('')
  const [useWebSearch, setUseWebSearch] = useState(true)
  const [useLibrary, setUseLibrary] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [workout, setWorkout] = useState<WorkoutContent | null>(null)
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadEquipment() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('equipment')
        .eq('id', user.id)
        .single()
      if (data?.equipment?.length) setEquipment(data.equipment)
    }
    loadEquipment()
  }, [])

  async function saveEquipment(newEquipment: string[]) {
    setEquipment(newEquipment)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ equipment: newEquipment }).eq('id', user.id)
  }

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setWorkout(null)

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration, intensity, kneeFriendly, equipment, chatfit, useWebSearch, useLibrary }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Er ging iets mis')
      setLoading(false)
    } else if (data.id) {
      router.push(`/instructor/workout/${data.id}`)
    } else {
      setWorkout(data.content)
      setWorkoutId(data.id)
      setTitle(data.title ?? '')
      setLoading(false)
    }
  }

  async function handlePublish() {
    if (!workoutId) return
    setSaving(true)
    await fetch(`/api/workouts/${workoutId}/publish`, { method: 'POST' })
    router.push('/instructor')
  }


  return (
    <div className="space-y-6">
      <div>
        <Link href="/instructor" className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="text-5xl mt-3">Nieuwe training</h1>
        <p className="text-muted text-sm mt-1">Kies de opzet; de training wordt gemaakt op basis van jullie eigen trainingen.</p>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-2">Duur</label>
          <div className="grid grid-cols-3 gap-2">
            {([30, 45, 60] as Duration[]).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={duration === d ? 'opt-on' : 'opt'}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-2">Intensiteit</label>
          <div className="grid grid-cols-3 gap-2">
            {(['laag', 'middel', 'hoog'] as Intensity[]).map((i) => (
              <button
                key={i}
                onClick={() => setIntensity(i)}
                className={intensity === i ? 'opt-on' : 'opt'}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setKneeFriendly(!kneeFriendly)}
          className={`toggle-row ${kneeFriendly ? 'border-ink bg-blush' : 'border-line bg-surface hover:border-ink'}`}
          aria-pressed={kneeFriendly}
        >
          <span>
            <span className="block font-label font-bold text-sm uppercase tracking-wider">Knieblessures in de groep</span>
            <span className="block text-xs text-muted mt-0.5">Elke oefening krijgt een knievriendelijk alternatief</span>
          </span>
          <span className={`toggle-box ${kneeFriendly ? 'bg-brand border-brand text-white' : 'border-line'}`}>
            {kneeFriendly ? '✓' : ''}
          </span>
        </button>

        <EquipmentPicker selected={equipment} onChange={saveEquipment} />
        <ChatFitInput value={chatfit} onChange={setChatfit} />

        <button
          onClick={() => setUseLibrary(!useLibrary)}
          className={`toggle-row ${useLibrary ? 'border-ink bg-blush' : 'border-line bg-surface hover:border-ink'}`}
          aria-pressed={useLibrary}
        >
          <span>
            <span className="block font-label font-bold text-sm uppercase tracking-wider">Bibliotheek als bron</span>
            <span className="block text-xs text-muted mt-0.5">Bouwt de training op uit passende BootCraft-trainingen</span>
          </span>
          <span className={`toggle-box ${useLibrary ? 'bg-brand border-brand text-white' : 'border-line'}`}>
            {useLibrary ? '✓' : ''}
          </span>
        </button>

        <button
          onClick={() => setUseWebSearch(!useWebSearch)}
          className={`toggle-row ${useWebSearch ? 'border-ink bg-blush' : 'border-line bg-surface hover:border-ink'}`}
          aria-pressed={useWebSearch}
        >
          <span>
            <span className="block font-label font-bold text-sm uppercase tracking-wider">Ook internet als bron</span>
            <span className="block text-xs text-muted mt-0.5">Zoekt online naar extra oefeningen, alleen met jouw materiaal</span>
          </span>
          <span className={`toggle-box ${useWebSearch ? 'bg-brand border-brand text-white' : 'border-line'}`}>
            {useWebSearch ? '✓' : ''}
          </span>
        </button>

        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
          {loading ? (useWebSearch ? 'Bezig, dit duurt iets langer…' : 'Training wordt gemaakt…') : 'Training maken'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-300 rounded-sm px-4 py-3 text-red-700">{error}</div>}

      {workout && (
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel van de training (optioneel)"
            className="input"
          />
          {editing && workoutId ? (
            <WorkoutEditor workoutId={workoutId} initialContent={workout} intensity={intensity} kneeFriendly={kneeFriendly} equipment={equipment} onClose={() => { setEditing(false) }} />
          ) : (
            <>
              <WorkoutDisplay workout={workout} showKneeAlternatives={true} />
              <div className="flex space-x-3">
                <button onClick={() => setEditing(true)} className="btn-secondary flex-1">Bewerken</button>
                <PDFExportButton workout={workout} title={title} />
              </div>
              <button onClick={handlePublish} disabled={saving} className="btn-primary w-full">
                {saving ? 'Bezig...' : 'Publiceren voor atleten'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
