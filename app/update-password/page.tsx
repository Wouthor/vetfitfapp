'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AuthShell from '@/components/AuthShell'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [status, setStatus] = useState<'checking' | 'ok' | 'none'>('checking')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setStatus(data.user ? 'ok' : 'none'))
  }, [])

  async function handleUpdate(e: React.FormEvent) {
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

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      // Uitloggen en opnieuw laten inloggen met het nieuwe wachtwoord, zodat er geen oude inlog blijft hangen
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login')
      }, 2000)
    }
  }

  return (
    <AuthShell title="Nieuw wachtwoord" subtitle="Kies een nieuw wachtwoord voor je account.">
      {status === 'checking' && <p className="text-muted">Even controleren…</p>}

      {status === 'none' && (
        <div className="space-y-4">
          <div className="bg-blush border border-berry/40 rounded-sm px-4 py-3 text-sm">
            <p className="font-bold">Deze resetlink werkt niet (meer)</p>
            <p className="mt-1">De link is verlopen of al gebruikt. Vraag een nieuwe aan en open de nieuwste mail.</p>
          </div>
          <Link href="/reset-password" className="btn-primary w-full text-center block">Nieuwe link aanvragen</Link>
        </div>
      )}

      {status === 'ok' && (<>

        {success ? (
          <div className="bg-green-50 border border-green-700 rounded-sm px-4 py-4 text-berry text-center">
            <p className="font-semibold">Wachtwoord gewijzigd!</p>
            <p className="text-sm mt-1">Je wordt doorgestuurd naar inloggen...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-muted mb-1.5">Nieuw wachtwoord</label>
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
              {loading ? 'Bezig...' : 'Wachtwoord opslaan'}
            </button>
          </form>
        )}
      </>)}
    </AuthShell>
  )
}
