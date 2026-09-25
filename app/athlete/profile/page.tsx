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
    streak >= 20 ? '20 op rij' :
    streak >= 10 ? '10 op rij' :
    streak >= 5  ? '5 op rij' : null

  const nextGoal = streak >= 20 ? null : streak >= 10 ? 20 : streak >= 5 ? 10 : 5

  return (
    <div className="space-y-6">
      <div>
        <Link href="/athlete" className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink">
          ← Trainingen
        </Link>
        <h1 className="text-5xl mt-3">{profile?.name ?? 'Mijn profiel'}</h1>
        <p className="text-muted text-sm mt-1">{profile?.email}</p>
      </div>

      <div className="grid grid-cols-2 border-2 border-ink bg-surface">
        <div className="px-4 py-3">
          <p className="sport-number text-6xl">{totalSignups}</p>
          <p className="sport-label mt-1">Keer meegedaan</p>
        </div>
        <div className="px-4 py-3 border-l border-line">
          <p className="sport-number text-6xl">{streak}</p>
          <p className="sport-label mt-1">Op rij</p>
        </div>
      </div>

      <div className={`rounded-sm px-4 py-5 ${hasStreakBadge ? 'bg-ink text-paper' : 'bg-surface border border-line'}`}>
        {hasStreakBadge && (
          <>
            <p className="font-label font-bold text-xs uppercase tracking-widest text-sage">Badge behaald</p>
            <p className="font-display text-5xl uppercase leading-none mt-1">{streakBadgeLabel}</p>
            <p className="text-sm text-sage mt-2">Je hebt {streak} trainingen op rij meegedaan.</p>
          </>
        )}
        {nextGoal && (
          <div className={hasStreakBadge ? 'mt-5' : ''}>
            <p className={`font-label font-bold text-xs uppercase tracking-widest ${hasStreakBadge ? 'text-sage' : 'text-muted'}`}>
              Volgende badge: {nextGoal} op rij
            </p>
            <div className="grid mt-2" style={{ gridTemplateColumns: `repeat(${nextGoal}, minmax(0, 1fr))`, gridColumnGap: '3px' }}>
              {Array.from({ length: nextGoal }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 ${i < streak ? (hasStreakBadge ? 'bg-paper' : 'bg-ink') : (hasStreakBadge ? 'bg-ink-soft' : 'bg-line')}`}
                />
              ))}
            </div>
            <p className={`text-sm mt-2 ${hasStreakBadge ? 'text-sage' : 'text-muted'}`}>
              Nog {nextGoal - streak} {nextGoal - streak === 1 ? 'training' : 'trainingen'} te gaan.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
