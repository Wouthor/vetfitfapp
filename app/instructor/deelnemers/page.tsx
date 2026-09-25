import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { splitTitle } from '@/lib/format'

function calculateStreak(
  allPublished: { id: string }[],
  userSignupIds: Set<string>
): number {
  let streak = 0
  for (const workout of allPublished) {
    if (userSignupIds.has(workout.id)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export default async function DeelnemersPage() {
  const supabase = await createClient()

  const [{ data: athletes }, { data: signups }, { data: publishedWorkouts }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, email')
      .eq('role', 'athlete')
      .order('name'),
    supabase
      .from('training_signups')
      .select('user_id, workout_id, signed_up_at, generated_workouts(id, title, created_at, duration, intensity)')
      .order('signed_up_at', { ascending: false }),
    supabase
      .from('generated_workouts')
      .select('id')
      .eq('published', true)
      .order('created_at', { ascending: false }),
  ])

  // Groepeer aanmeldingen per atleet
  const signupsByAthlete: Record<string, { title: string; created_at: string; duration: number; intensity: string; workout_id: string }[]> = {}
  for (const s of signups ?? []) {
    const w = s.generated_workouts as any
    if (!w) continue
    if (!signupsByAthlete[s.user_id]) signupsByAthlete[s.user_id] = []
    signupsByAthlete[s.user_id].push({
      workout_id: s.workout_id,
      title: w.title ?? 'Training zonder titel',
      created_at: w.created_at,
      duration: w.duration,
      intensity: w.intensity,
    })
  }

  const published = publishedWorkouts ?? []

  return (
    <div className="space-y-6">
      <div>
        <Link href="/instructor" className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="text-5xl mt-3">Deelnemers</h1>
        <p className="text-muted text-sm mt-1">Per sporter: bij welke trainingen ze zich hebben aangemeld.</p>
      </div>

      {(athletes?.length ?? 0) === 0 && (
        <div className="border-2 border-dashed border-line px-5 py-10 text-center">
          <p className="font-display text-2xl uppercase">Nog geen sporters</p>
          <p className="text-muted text-sm mt-1">Zodra iemand een account aanmaakt, verschijnt die hier.</p>
        </div>
      )}

      <div className="space-y-4">
        {athletes?.map((athlete) => {
          const workouts = signupsByAthlete[athlete.id] ?? []
          const signupIds = new Set(workouts.map((w) => w.workout_id))
          const streak = calculateStreak(published, signupIds)
          const hasStreakBadge = streak >= 5
          const badgeLabel =
            streak >= 20 ? '20 op rij' :
            streak >= 10 ? '10 op rij' :
            streak >= 5  ? '5 op rij' : null

          return (
            <div key={athlete.id} className="card">
              <div className="flex items-start justify-between">
                <div className="min-w-0 pr-3">
                  <p className="font-display text-2xl uppercase leading-none truncate">{athlete.name ?? athlete.email}</p>
                  <p className="text-xs text-muted mt-1 truncate">{athlete.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="sport-number text-3xl">{workouts.length}</p>
                  <p className="sport-label">{workouts.length === 1 ? 'training' : 'trainingen'}</p>
                </div>
              </div>
              {hasStreakBadge && <span className="badge-live inline-block mt-2">{badgeLabel}</span>}

              {workouts.length === 0 ? (
                <p className="text-sm text-faint mt-3">Nog geen aanmeldingen.</p>
              ) : (
                <div className="mt-3 border-t border-line">
                  {workouts.map((w) => (
                    <Link
                      key={w.workout_id}
                      href={`/instructor/workout/${w.workout_id}`}
                      className="flex items-center justify-between py-2 border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                    >
                      <span className="text-sm font-medium truncate">{splitTitle(w.title).name}</span>
                      <span className="text-xs text-muted ml-3 shrink-0">
                        {new Date(w.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
