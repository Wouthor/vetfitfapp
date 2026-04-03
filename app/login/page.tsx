'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Ongeldig e-mailadres of wachtwoord')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / titel */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden">
            <Image src="/icon.png" alt="VetFitFapp" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white">VetFitFapp</h1>
          <p className="text-gray-400 mt-1">Log in om verder te gaan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              E-mailadres
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              required
              className="input dark"
              style={{
                backgroundColor: '#1f2937',
                borderColor: '#374151',
                color: 'white',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input dark"
              style={{
                backgroundColor: '#1f2937',
                borderColor: '#374151',
                color: 'white',
              }}
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
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
            className="block w-full py-3 px-6 border border-gray-700 hover:border-orange-500 text-gray-300 hover:text-orange-400 font-medium rounded-xl transition-colors text-sm"
          >
            Nog geen account? <span className="text-orange-400 font-semibold">Aanmelden</span>
          </Link>
          <Link
            href="/reset-password"
            className="block text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Wachtwoord vergeten?
          </Link>
        </div>
      </div>
    </div>
  )
}
