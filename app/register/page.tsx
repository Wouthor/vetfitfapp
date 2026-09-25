'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell from '@/components/AuthShell'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Wachtwoorden komen niet overeen')
      return
    }
    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens zijn')
      return
    }

    if (!name.trim()) {
      setError('Vul je naam in')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: name.trim() }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Er ging iets mis')
      setLoading(false)
    } else {
      await supabase.auth.signInWithPassword({ email, password })
      router.push('/')
      router.refresh()
    }
  }

  return (
    <AuthShell title="Account aanmaken" subtitle="Meld je aan om mee te trainen.">

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-1.5">Jouw naam</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Voor- en achternaam"
              required
              className="input"
            />
          </div>

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
              placeholder="Minimaal 6 tekens"
              required
              className="input"
            />
          </div>

          <div>
            <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-1.5">Herhaal wachtwoord</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Account aanmaken...' : 'Account aanmaken'}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Al een account?{' '}
          <Link href="/login" className="font-bold text-ink underline underline-offset-2">Inloggen</Link>
        </p>
    </AuthShell>
  )
}
