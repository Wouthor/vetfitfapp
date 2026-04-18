import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import InlineSignupButton from '@/components/InlineSignupButton'

export default async function AthletePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: workouts }, { data: mySignups }] = await Promise.all([
    supabase
      .from('generated_workouts')
      .select('id, title, duration, intensity, knee_friendly, completed_at, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('training_signups')
      .select('workout_id')
      .eq('user_id', user?.id ?? ''),
  ])

  // Haal aanmeldingstelling op per training
  const workoutIds = workouts?.map((w) => w.id) ?? []
  const { data: signupCounts } = workoutIds.length > 0
    ? await supabase
        .from('training_signups')
        .select('workout_id')
        .in('workout_id', workoutIds)
    : { data: [] }

  const signedUpIds = new Set(mySignups?.map((s) => s.workout_id) ?? [])
  const countByWorkout: Record<string, number> = {}
  for (const s of signupCounts ?? []) {
    countByWorkout[s.workout_id] = (countByWorkout[s.workout_id] ?? 0) + 1
  }

  const done = workouts?.filter((w) => w.completed_at) ?? []
  const upcoming = workouts?.filter((w) => !w.completed_at) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trainingen</h1>
          <p className="text-[#ff99ff] mt-1">Gepubliceerde trainingen van de instructor</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/athlete/profile" className="btn-ghost text-sm px-3 py-2">
            Mijn profiel
          </Link>
          <Link href="/athlete/generate" className="btn-primary text-sm px-4 py-2">
            Maak zelf een training
          </Link>
        </div>
      </div>

      {upcoming.length === 0 && done.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-[#ff99ff]">Nog geen trainingen gepubliceerd.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Aankomend</h2>
          <div className="space-y-2">
            {upcoming.map((w) => {
              const count = countByWorkout[w.id] ?? 0
              const iJoin = signedUpIds.has(w.id)
              return (
                <div key={w.id} className="card hover:border-magenta-500 transition-colors">
                  <Link href={`/athlete/workout/${w.id}`} className="block">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{w.title ?? 'Training zonder titel'}</p>
                        <p className="text-sm text-[#ff99ff] mt-0.5">
                          {w.duration} min · {w.intensity}
                          {w.knee_friendly ? ' · knie-vriendelijk' : ''}
                        </p>
                        <p className="text-xs text-[#ff99ff] mt-0.5 opacity-60">
                          {new Date(w.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-xs text-[#ff99ff] opacity-60 ml-2">→</span>
                    </div>
                  </Link>
                  <InlineSignupButton workoutId={w.id} isSignedUp={iJoin} count={count} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Gedaan</h2>
          <div className="space-y-2">
            {done.map((w) => (
              <Link
                key={w.id}
                href={`/athlete/workout/${w.id}`}
                className="block card hover:border-electric-500 transition-colors opacity-75"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{w.title ?? 'Training zonder titel'}</p>
                    <p className="text-sm text-[#ff99ff] mt-0.5">
                      {w.duration} min · {w.intensity}
                    </p>
                    <p className="text-xs text-electric-400 mt-0.5">
                      ✓ Gedaan op {new Date(w.completed_at).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-electric-900 text-electric-400">
                    Gedaan
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
