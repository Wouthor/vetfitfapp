'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell from '@/components/AuthShell'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    supabase.auth.signInWithPassword({ email, password })
      .then(function(result) {
        if (result.error) {
          setError('Ongeldig e-mailadres of wachtwoord (' + result.error.message + ')')
          setLoading(false)
        } else {
          router.push('/')
          router.refresh()
        }
      })
      .catch(function(err) {
        setError('Fout: ' + (err && err.message ? err.message : String(err)))
        setLoading(false)
      })
  }

  return (
    <AuthShell title="Inloggen" subtitle="Welkom terug. Log in om je trainingen te zien.">

        <form onSubmit={handleLogin} className="space-y-4">
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

          <div>
            <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-1.5">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-sm px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center"
          >
            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <Link
            href="/register"
            className="btn-secondary w-full text-center block"
          >
            Nog geen account? Aanmelden
          </Link>
          <Link href="/reset-password" className="block text-sm text-muted hover:text-ink transition-colors">
            Wachtwoord vergeten?
          </Link>
        </div>
    </AuthShell>
  )
}
