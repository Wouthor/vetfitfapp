'use client'

import { useState, useEffect } from 'react'
import type { Duration, Intensity, WorkoutContent } from '@/lib/types'
import WorkoutDisplay from '@/components/WorkoutDisplay'
import PDFExportButton from '@/components/PDFExportButton'
import EquipmentPicker from '@/components/EquipmentPicker'
import ChatFitInput from '@/components/ChatFitInput'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AthleteGeneratePage() {
  const [duration, setDuration] = useState<Duration>(60)
  const [intensity, setIntensity] = useState<Intensity>('middel')
  const [kneeFriendly, setKneeFriendly] = useState(false)
  const [equipment, setEquipment] = useState<string[]>([])
  const [chatfit, setChatfit] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [workout, setWorkout] = useState<WorkoutContent | null>(null)
  const [title, setTitle] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadInstructorEquipment() {
      const { data } = await supabase
        .from('profiles')
        .select('equipment')
        .eq('role', 'instructor')
        .limit(1)
        .single()
      if (data?.equipment?.length) setEquipment(data.equipment)
    }
    loadInstructorEquipment()
  }, [])

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
    } else {
      setWorkout(data.content)
      setTitle(data.title ?? `Training ${duration} min`)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/athlete" className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink">
          ← Trainingen
        </Link>
        <h1 className="text-5xl mt-3">Zelf trainen</h1>
        <p className="text-muted text-sm mt-1">Kies hoe lang en hoe zwaar, dan maken we een training voor je.</p>
      </div>

      {!workout && (
        <div className="card space-y-5">
          <div>
            <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-2">Hoe lang?</label>
            <div className="grid grid-cols-3 gap-2">
              {([30, 45, 60] as Duration[]).map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className={duration === d ? 'opt-on' : 'opt'}>
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-2">Intensiteit</label>
            <div className="grid grid-cols-3 gap-2">
              {(['laag', 'middel', 'hoog'] as Intensity[]).map((value) => (
                <button key={value} onClick={() => setIntensity(value)}
                  className={intensity === value ? 'opt-on' : 'opt'}>
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setKneeFriendly(!kneeFriendly)}
            className={`toggle-row ${kneeFriendly ? 'border-ink bg-mint' : 'border-line bg-surface hover:border-ink'}`}
            aria-pressed={kneeFriendly}>
            <span>
              <span className="block font-label font-bold text-sm uppercase tracking-wider">Last van mijn knieën</span>
              <span className="block text-xs text-muted mt-0.5">Oefeningen worden aangepast</span>
            </span>
            <span className={`toggle-box ${kneeFriendly ? 'bg-ink border-ink text-paper' : 'border-line'}`}>
              {kneeFriendly ? '✓' : ''}
            </span>
          </button>

          <EquipmentPicker selected={equipment} onChange={setEquipment} />
          <ChatFitInput value={chatfit} onChange={setChatfit} />

          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full py-4">
            {loading ? (
              'Training wordt gemaakt…'
            ) : 'Training starten'}
          </button>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-300 rounded-sm px-4 py-3 text-red-700">{error}</div>}

      {workout && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink">{title}</h2>
            <button onClick={() => setWorkout(null)} className="btn-ghost text-sm">Nieuwe training</button>
          </div>
          <WorkoutDisplay workout={workout} showKneeAlternatives={kneeFriendly} />
          <PDFExportButton workout={workout} title={title} />
        </div>
      )}
    </div>
  )
}
