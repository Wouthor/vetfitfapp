'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

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
      redirectTo: `${window.location.origin}/update-password`,
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
    <div className="min-h-screen flex items-center justify-center bg-void px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden">
            <Image src="/icon.png" alt="VetFitFapp" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white">Wachtwoord vergeten</h1>
          <p className="text-[#4a5e8a] mt-1">We sturen je een resetlink</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="bg-green-900/30 border border-green-800 rounded-xl px-4 py-4 text-green-400 text-center">
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
              <label className="block text-sm font-medium text-[#7b8db8] mb-1.5">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.nl"
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
              {loading ? 'Bezig...' : 'Resetlink versturen'}
            </button>

            <Link href="/login" className="block text-center text-gray-500 hover:text-[#7b8db8] text-sm transition-colors">
              Terug naar inloggen
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
