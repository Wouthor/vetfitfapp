'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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
    <div className="min-h-screen flex items-center justify-center bg-void px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden">
            <Image src="/icon.png" alt="VetFitFapp" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white">VetFitFapp</h1>
          <p className="text-[#ffccff] mt-1">Maak een account aan</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Jouw naam</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Voor- en achternaam"
              required
              className="w-full bg-void-input border border-void-border rounded-xl px-4 py-3 text-white placeholder-[#4a5e8a] focus:outline-none focus:ring-2 focus:ring-magenta-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              required
              className="w-full bg-void-input border border-void-border rounded-xl px-4 py-3 text-white placeholder-[#4a5e8a] focus:outline-none focus:ring-2 focus:ring-magenta-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimaal 6 tekens"
              required
              className="w-full bg-void-input border border-void-border rounded-xl px-4 py-3 text-white placeholder-[#4a5e8a] focus:outline-none focus:ring-2 focus:ring-magenta-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Herhaal wachtwoord</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-void-input border border-void-border rounded-xl px-4 py-3 text-white placeholder-[#4a5e8a] focus:outline-none focus:ring-2 focus:ring-magenta-500"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Account aanmaken...' : 'Account aanmaken'}
          </button>
        </form>

        <p className="text-center text-[#ffccff] text-sm mt-6">
          Al een account?{' '}
          <Link href="/login" className="text-neon-400 hover:text-neon-300">Inloggen</Link>
        </p>
      </div>
    </div>
  )
}
