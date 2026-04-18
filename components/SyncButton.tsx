'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ synced: number; skipped: number; total: number; errors: string[] } | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSync(reset = false) {
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
    <div className="space-y-2">
      <div className="flex space-x-2">
        <button
          onClick={() => handleSync(false)}
          disabled={loading}
          className="btn-secondary flex-1 flex items-center justify-center space-x-2"
        >
          {loading ? <><span className="animate-spin">⟳</span> Bezig...</> : <><span>🔄</span> Drive synchroniseren</>}
        </button>
        <button
          onClick={() => handleSync(true)}
          disabled={loading}
          className="bg-void-input hover:bg-void-border text-[#4a5e8a] hover:text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors border border-void-border"
          title="Alles wissen en opnieuw synchroniseren"
        >
          ↺ Reset
        </button>
      </div>

      {result && (
        <div className="bg-green-900/30 border border-green-800 rounded-xl px-4 py-3 text-green-400 text-sm">
          Klaar! {result.synced} nieuwe trainingen opgehaald, {result.skipped} al aanwezig ({result.total} totaal in Drive).
          {result.errors.length > 0 && (
            <div className="mt-1 text-xs text-yellow-400">
              {result.errors.length} fout(en): {result.errors[0]}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
