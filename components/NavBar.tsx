'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Role } from '@/lib/types'

interface NavBarProps {
  role: Role
  email?: string
}

export default function NavBar({ role, email }: NavBarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-ink sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={role === 'instructor' ? '/instructor' : '/athlete'} className="flex items-baseline space-x-3">
          <span className="font-display text-paper text-2xl leading-none tracking-wide">VETFIT</span>
          <span className="font-label font-bold text-[11px] uppercase tracking-widest text-sage">
            {role === 'instructor' ? 'Instructeur' : 'Bootcamp'}
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          {email && (
            <span className="text-sm text-sage hidden sm:block truncate max-w-32">
              {email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="font-label font-bold text-xs uppercase tracking-widest text-sage hover:text-paper transition-colors"
          >
            Uitloggen
          </button>
        </div>
      </div>
    </header>
  )
}
