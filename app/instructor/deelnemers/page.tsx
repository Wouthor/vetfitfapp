import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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
        <Link href="/instructor" className="text-sm text-[#ff99ff] hover:text-white mb-2 inline-block">
          ← Terug
        </Link>
        <h1 className="text-2xl font-bold text-white">Deelnemers</h1>
        <p className="text-[#ff99ff] mt-1">Per atleet welke trainingen ze hebben aangemeld</p>
      </div>

      {(athletes?.length ?? 0) === 0 && (
        <div className="card text-center py-10">
          <p className="text-[#ff99ff]">Nog geen atleten aangemeld.</p>
        </div>
      )}

      <div className="space-y-4">
        {athletes?.map((athlete) => {
          const workouts = signupsByAthlete[athlete.id] ?? []
          const signupIds = new Set(workouts.map((w) => w.workout_id))
          const streak = calculateStreak(published, signupIds)
          const hasStreakBadge = streak >= 5
          const badgeLabel =
            streak >= 20 ? '🏆 20 op rij' :
            streak >= 10 ? '🥇 10 op rij' :
            streak >= 5  ? '🔥 5 op rij' : null

          return (
            <div key={athlete.id} className="card space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{athlete.name ?? athlete.email}</p>
                  <p className="text-xs text-[#ff99ff] opacity-60">{athlete.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {hasStreakBadge && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-neon-400/20 border border-neon-400 text-neon-400">
                      {badgeLabel}
                    </span>
                  )}
                  <span className="text-xs text-[#ff99ff] opacity-70">
                    {workouts.length} {workouts.length === 1 ? 'training' : 'trainingen'}
                  </span>
                </div>
              </div>

              {workouts.length === 0 ? (
                <p className="text-xs text-[#ff99ff] opacity-50">Nog geen aanmeldingen.</p>
              ) : (
                <div className="space-y-1">
                  {workouts.map((w) => (
                    <Link
                      key={w.workout_id}
                      href={`/instructor/workout/${w.workout_id}`}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-void-input hover:bg-magenta-900/20 transition-colors"
                    >
                      <span className="text-sm text-white truncate">{w.title}</span>
                      <span className="text-xs text-[#ff99ff] opacity-60 ml-3 shrink-0">
                        {new Date(w.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
