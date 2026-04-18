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
        <Link href="/athlete" className="text-sm text-[#ff99ff] hover:text-white mb-2 inline-block">
          ← Terug
        </Link>
        <h1 className="text-2xl font-bold text-white">Zelf genereren</h1>
        <p className="text-[#ff99ff] mt-1">Kies je parameters en start de training</p>
      </div>

      {!workout && (
        <div className="card bg-gray-900 border-gray-800 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Hoe lang?</label>
            <div className="grid grid-cols-3 gap-2">
              {([30, 45, 60] as Duration[]).map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`py-4 rounded-xl font-bold text-lg transition-colors ${duration === d ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                  {d}'
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Intensiteit</label>
            <div className="grid grid-cols-3 gap-2">
              {([{ value: 'laag', emoji: '😌' }, { value: 'middel', emoji: '💪' }, { value: 'hoog', emoji: '🔥' }] as { value: Intensity; emoji: string }[]).map(({ value, emoji }) => (
                <button key={value} onClick={() => setIntensity(value)}
                  className={`py-4 rounded-xl font-semibold capitalize transition-colors ${intensity === value ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                  <span className="text-xl block mb-1">{emoji}</span>
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setKneeFriendly(!kneeFriendly)}
            className={`w-full flex items-center space-x-3 py-4 px-4 rounded-xl transition-colors ${kneeFriendly ? 'bg-blue-900/50 border border-blue-700 text-blue-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            <span className="text-2xl">🦵</span>
            <div className="text-left">
              <p className="font-semibold">Knieblessures</p>
              <p className="text-xs opacity-70">Oefeningen worden aangepast</p>
            </div>
            <div className={`ml-auto w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${kneeFriendly ? 'bg-blue-500 text-white' : 'bg-gray-600'}`}>
              {kneeFriendly ? '✓' : ''}
            </div>
          </button>

          <EquipmentPicker selected={equipment} onChange={setEquipment} />
          <ChatFitInput value={chatfit} onChange={setChatfit} />

          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full text-lg py-4">
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="animate-spin inline-block">⟳</span> Training wordt gemaakt...
              </span>
            ) : 'Training starten 🏋️'}
          </button>
        </div>
      )}

      {error && <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-red-400">{error}</div>}

      {workout && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={() => setWorkout(null)} className="btn-ghost text-sm">Nieuwe training</button>
          </div>
          <WorkoutDisplay workout={workout} showKneeAlternatives={kneeFriendly} />
          <PDFExportButton workout={workout} title={title} />
        </div>
      )}
    </div>
  )
}
