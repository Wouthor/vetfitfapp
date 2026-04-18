'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
      body: JSON.stringify({ duration, intensity, kneeFriendly, equipment, chatfit }),
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
        <h1 className="text-2xl font-bold text-white">Training genereren</h1>
        <p className="text-[#ff99ff] mt-1">Kies parameters en laat AI een training maken</p>
      </div>

      <div className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#ffccff] mb-2">Duur</label>
          <div className="grid grid-cols-3 gap-2">
            {([30, 45, 60] as Duration[]).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`py-3 rounded-xl font-semibold transition-colors ${
                  duration === d ? 'bg-magenta-500 text-white' : 'bg-void-input text-[#ffccff] hover:border-magenta-700 border border-void-border'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#ffccff] mb-2">Intensiteit</label>
          <div className="grid grid-cols-3 gap-2">
            {(['laag', 'middel', 'hoog'] as Intensity[]).map((i) => (
              <button
                key={i}
                onClick={() => setIntensity(i)}
                className={`py-3 rounded-xl font-semibold capitalize transition-colors ${
                  intensity === i ? 'bg-magenta-500 text-white' : 'bg-void-input text-[#ffccff] hover:border-magenta-700 border border-void-border'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setKneeFriendly(!kneeFriendly)}
          className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-colors border ${
            kneeFriendly
              ? 'bg-electric-900/50 border-electric-700 text-electric-300'
              : 'bg-void-input border-void-border text-[#ffccff] hover:border-magenta-700'
          }`}
        >
          <span className="font-medium">Knieblessures in de groep</span>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${kneeFriendly ? 'bg-electric-500 text-white' : 'bg-void-border'}`}>
            {kneeFriendly ? '✓' : ''}
          </span>
        </button>

        <EquipmentPicker selected={equipment} onChange={saveEquipment} />
        <ChatFitInput value={chatfit} onChange={setChatfit} />

        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
          {loading ? <span className="flex items-center justify-center space-x-2"><span className="animate-spin">⟳</span> Genereren...</span> : 'Training genereren'}
        </button>
      </div>

      {error && <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-red-400">{error}</div>}

      {workout && (
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel van de training (optioneel)"
            className="input"
          />
          {editing && workoutId ? (
            <WorkoutEditor workoutId={workoutId} initialContent={workout} onClose={() => { setEditing(false) }} />
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
