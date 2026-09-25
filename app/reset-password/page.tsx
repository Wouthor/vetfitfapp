'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AuthShell from '@/components/AuthShell'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/update-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Wachtwoord vergeten" subtitle="Vul je e-mailadres in, dan sturen we je een resetlink.">

        {sent ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-700 rounded-sm px-4 py-4 text-moss text-center">
              <p className="font-semibold">E-mail verstuurd!</p>
              <p className="text-sm mt-1">Check je inbox voor de resetlink.</p>
            </div>
            <Link href="/login" className="btn-secondary w-full text-center block">
              Terug naar inloggen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-1.5">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.nl"
                required
                className="input"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 rounded-sm px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Bezig...' : 'Resetlink versturen'}
            </button>

            <Link href="/login" className="block text-center text-muted hover:text-ink text-sm transition-colors">
              Terug naar inloggen
            </Link>
          </form>
        )}
    </AuthShell>
  )
}
