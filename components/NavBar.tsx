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
    <header className="bg-magenta-700 border-b border-magenta-600 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={role === 'instructor' ? '/instructor' : '/athlete'} className="flex items-center gap-2">
          <span className="text-xl">🏋️</span>
          <span className="font-bold text-white">VetFitFapp</span>
          {role === 'instructor' && (
            <span className="text-xs bg-neon-400 text-[#1a1a00] px-2 py-0.5 rounded-full font-semibold">
              Instructeur
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          {email && (
            <span className="text-sm text-[#ffccff] hidden sm:block truncate max-w-32">
              {email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-[#ffccff] hover:text-white transition-colors"
          >
            Uitloggen
          </button>
        </div>
      </div>
    </header>
  )
}
