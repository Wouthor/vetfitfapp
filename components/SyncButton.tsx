'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ synced: number; skipped: number; total: number; errors: string[] } | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSync(reset = false) {
    if (reset && !window.confirm('Alle opgehaalde Drive-trainingen wissen en opnieuw ophalen?')) return
    setLoading(true)
    setError('')
    setResult(null)

    if (reset) {
      const resetRes = await fetch('/api/sync/reset', { method: 'POST' })
      if (!resetRes.ok) {
        const data = await resetRes.json()
        setError(data.error ?? 'Reset mislukt')
        setLoading(false)
        return
      }
    }

    const res = await fetch('/api/sync', { method: 'POST' })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Sync mislukt')
    } else {
      setResult(data)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="border-b border-line">
      <div className="flex items-center justify-between py-3.5">
        <button
          onClick={() => handleSync(false)}
          disabled={loading}
          className="font-label font-bold text-sm uppercase tracking-wider text-left disabled:opacity-50"
        >
          {loading ? 'Bezig met ophalen…' : 'Drive-trainingen ophalen'}
        </button>
        <button
          onClick={() => handleSync(true)}
          disabled={loading}
          className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-red-700 transition-colors disabled:opacity-50"
          title="Alles wissen en opnieuw ophalen"
        >
          Opnieuw
        </button>
      </div>

      {result && (
        <div className="bg-blush px-3 py-2.5 mb-3 text-berry text-sm rounded-sm">
          {result.synced} nieuwe trainingen opgehaald, {result.skipped} waren er al ({result.total} in Drive).
          {result.errors.length > 0 && (
            <div className="mt-1 text-xs text-red-700">
              {result.errors.length} {result.errors.length === 1 ? 'bestand' : 'bestanden'} niet gelukt: {result.errors[0]}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-sm px-3 py-2.5 mb-3 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
