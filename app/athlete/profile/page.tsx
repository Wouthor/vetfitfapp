import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

function calculateStreak(
  publishedWorkouts: { id: string }[],
  userSignupIds: Set<string>
): number {
  let streak = 0
  // Ga van meest recent naar oudst, tel opeenvolgende aanmeldingen
  for (const workout of publishedWorkouts) {
    if (userSignupIds.has(workout.id)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export default async function AthleteProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: publishedWorkouts }, { data: mySignups }] = await Promise.all([
    supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single(),
    supabase
      .from('generated_workouts')
      .select('id')
      .eq('published', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('training_signups')
      .select('workout_id')
      .eq('user_id', user.id),
  ])

  const signupIds = new Set(mySignups?.map((s) => s.workout_id) ?? [])
  const streak = calculateStreak(publishedWorkouts ?? [], signupIds)
  const totalSignups = mySignups?.length ?? 0
  const hasStreakBadge = streak >= 5

  const streakBadgeLabel =
    streak >= 20 ? '🏆 20 op rij' :
    streak >= 10 ? '🥇 10 op rij' :
    streak >= 5  ? '🔥 5 op rij' : null

  return (
    <div className="space-y-6">
      <div>
        <Link href="/athlete" className="text-sm text-[#ff99ff] hover:text-white mb-2 inline-block">
          ← Terug
        </Link>
        <h1 className="text-2xl font-bold text-white">Mijn profiel</h1>
      </div>

      <div className="card space-y-2">
        <p className="text-lg font-semibold text-white">{profile?.name ?? 'Naamloos'}</p>
        <p className="text-sm text-[#ff99ff]">{profile?.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-3xl font-bold text-magenta-400">{totalSignups}</p>
          <p className="text-sm text-[#ff99ff] mt-1">Trainingen aangemeld</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-neon-400">{streak}</p>
          <p className="text-sm text-[#ff99ff] mt-1">Huidige streak</p>
        </div>
      </div>

      {hasStreakBadge ? (
        <div className="card border-neon-400 bg-neon-400/10 text-center py-6 space-y-2">
          <p className="text-4xl">{streakBadgeLabel?.split(' ')[0]}</p>
          <p className="text-lg font-bold text-neon-400">Streak badge behaald!</p>
          <p className="text-sm text-[#ff99ff]">
            Je hebt {streak} trainingen op rij aangemeld. Blijf zo doorgaan!
          </p>
        </div>
      ) : (
        <div className="card text-center py-6 space-y-2">
          <p className="text-4xl">🎯</p>
          <p className="text-sm text-[#ff99ff]">
            Nog {5 - streak} training{5 - streak !== 1 ? 'en' : ''} op rij voor je eerste badge!
          </p>
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-2 rounded-full ${i < streak ? 'bg-neon-400' : 'bg-void-input'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
