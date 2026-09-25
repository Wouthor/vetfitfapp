'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Duration, Intensity } from '@/lib/types'

interface CreateFromLibraryProps {
  libraryId: string
  equipment: string[]
  defaultDuration: Duration
}

// Maakt van een bibliotheektraining een complete Nederlandse training (warming-up, hoofddeel, cooling-down)
export default function CreateFromLibrary({ libraryId, equipment, defaultDuration }: CreateFromLibraryProps) {
  const router = useRouter()
  const [duration, setDuration] = useState<Duration>(defaultDuration)
  const [intensity, setIntensity] = useState<Intensity>('middel')
  const [kneeFriendly, setKneeFriendly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, intensity, kneeFriendly, equipment, libraryIds: [libraryId], useLibrary: true, useWebSearch: false }),
      })
      const data = await res.json()
      if (!res.ok || !data.id) {
        setError(data.error ?? 'Er ging iets mis. Probeer het opnieuw.')
        setLoading(false)
        return
      }
      router.push(`/instructor/workout/${data.id}`)
    } catch {
      setError('Geen verbinding. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-ink text-paper rounded-sm p-4">
      <p className="font-display text-2xl uppercase leading-none">Maak hier een training van</p>
      <p className="text-sm text-sage mt-1.5">
        Wordt vertaald naar het Nederlands, aangepast aan je materiaal en aangevuld tot een complete training.
      </p>

      <p className="font-label font-bold text-xs uppercase tracking-widest text-sage mt-4 mb-1.5">Duur</p>
      <div className="grid grid-cols-3 gap-2">
        {([30, 45, 60] as Duration[]).map((d) => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            aria-pressed={duration === d}
            className={`py-2.5 rounded-sm font-label font-bold uppercase tracking-wider border-2 transition-colors ${
              duration === d ? 'bg-paper text-ink border-paper' : 'border-ink-soft text-sage hover:border-sage'
            }`}
          >
            {d} min
          </button>
        ))}
      </div>

      <p className="font-label font-bold text-xs uppercase tracking-widest text-sage mt-3 mb-1.5">Intensiteit</p>
      <div className="grid grid-cols-3 gap-2">
        {(['laag', 'middel', 'hoog'] as Intensity[]).map((i) => (
          <button
            key={i}
            onClick={() => setIntensity(i)}
            aria-pressed={intensity === i}
            className={`py-2.5 rounded-sm font-label font-bold uppercase tracking-wider border-2 transition-colors ${
              intensity === i ? 'bg-paper text-ink border-paper' : 'border-ink-soft text-sage hover:border-sage'
            }`}
          >
            {i}
          </button>
        ))}
      </div>

      <label className="flex items-center text-sm mt-3">
        <input type="checkbox" checked={kneeFriendly} onChange={(e) => setKneeFriendly(e.target.checked)} className="mr-2 w-4 h-4 accent-[#9fb8aa]" />
        Knieblessures in de groep
      </label>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full mt-4 bg-paper text-ink hover:bg-sage font-label font-bold uppercase tracking-wider py-3.5 rounded-sm transition-colors disabled:opacity-60"
      >
        {loading ? 'Training wordt gemaakt…' : 'Training maken →'}
      </button>
      {error && <p className="text-sm text-red-300 mt-2">{error}</p>}
    </div>
  )
}
