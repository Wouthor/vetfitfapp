import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SyncButton from '@/components/SyncButton'
import WhatsAppReminderButton from '@/components/WhatsAppReminderButton'

export default async function InstructorDashboard() {
  const supabase = await createClient()

  const [{ count: sourceCount }, { data: recentWorkouts }] = await Promise.all([
    supabase.from('source_workouts').select('*', { count: 'exact', head: true }),
    supabase
      .from('generated_workouts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[#4a5e8a] mt-1">Beheer je bootcamp trainingen</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-3xl font-bold text-magenta-400">{sourceCount ?? 0}</p>
          <p className="text-sm text-[#4a5e8a] mt-1">Trainingen in Drive</p>
        </div>
        <div className="card">
          <p className="text-3xl font-bold text-neon-400">{recentWorkouts?.length ?? 0}</p>
          <p className="text-sm text-[#4a5e8a] mt-1">Gegenereerd</p>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/instructor/generate" className="btn-primary w-full text-center block">
          Nieuwe training genereren
        </Link>
        <WhatsAppReminderButton />
        <SyncButton />
      </div>

      {recentWorkouts && recentWorkouts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Recente trainingen</h2>
          <div className="space-y-2">
            {recentWorkouts.map((w) => (
              <Link
                key={w.id}
                href={`/instructor/workout/${w.id}`}
                className="block card hover:border-magenta-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{w.title ?? 'Training zonder titel'}</p>
                    <p className="text-sm text-[#4a5e8a] mt-0.5">
                      {w.duration} min · {w.intensity}
                    </p>
                    {w.completed_at && (
                      <p className="text-xs text-electric-400 mt-0.5">
                        ✓ Gedaan op {new Date(w.completed_at).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    w.published
                      ? 'bg-electric-900 text-electric-400'
                      : 'bg-void-input text-[#4a5e8a]'
                  }`}>
                    {w.published ? 'Gepubliceerd' : 'Concept'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
