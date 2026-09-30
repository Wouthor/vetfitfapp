import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { randomHeroPhoto } from '@/lib/photos'
import { splitTitle, formatWorkoutDate } from '@/lib/format'
import WhatsAppReminderButton from '@/components/WhatsAppReminderButton'
import SwipeToDelete from '@/components/SwipeToDelete'

export default async function InstructorDashboard() {
  const supabase = await createClient()

  const [{ count: conceptCount }, { count: generatedCount }, { count: liveCount }, { data: recentWorkouts }, { data: signups }, { data: ratings }, { data: athletes }] = await Promise.all([
    supabase.from('generated_workouts').select('*', { count: 'exact', head: true }).eq('published', false).is('completed_at', null),
    supabase.from('generated_workouts').select('*', { count: 'exact', head: true }),
    supabase.from('generated_workouts').select('*', { count: 'exact', head: true }).eq('published', true).is('completed_at', null),
    supabase
      .from('generated_workouts')
      .select('id, title, duration, intensity, published, completed_at, created_at, created_by')
      .order('created_at', { ascending: false })
      .limit(7),
    supabase
      .from('training_signups')
      .select('workout_id'),
    supabase
      .from('training_ratings')
      .select('workout_id, rating, comment'),
    supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'athlete'),
  ])

  // Trainingen die een sporter zelf heeft gemaakt: naam van de maker tonen
  const athleteNames: Record<string, string> = {}
  for (const a of athletes ?? []) athleteNames[a.id] = a.name ?? 'een sporter'

  const signupCountByWorkout: Record<string, number> = {}
  for (const s of signups ?? []) {
    signupCountByWorkout[s.workout_id] = (signupCountByWorkout[s.workout_id] ?? 0) + 1
  }

  const ratingsByWorkout: Record<string, { rating: number; comment?: string | null }[]> = {}
  for (const r of ratings ?? []) {
    if (!ratingsByWorkout[r.workout_id]) ratingsByWorkout[r.workout_id] = []
    ratingsByWorkout[r.workout_id].push({ rating: r.rating, comment: r.comment })
  }
  function avgRating(id: string): number | null {
    const rs = ratingsByWorkout[id]
    if (!rs?.length) return null
    return Math.round((rs.reduce((a, b) => a + b.rating, 0) / rs.length) * 10) / 10
  }
  function starsDisplay(avg: number): string {
    return '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg))
  }
  function commentsForWorkout(id: string): string[] {
    return (ratingsByWorkout[id] ?? [])
      .map(r => r.comment)
      .filter((c): c is string => !!c)
  }

  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-6">
      <div className="relative -mx-4 -mt-6 h-48 overflow-hidden bg-ink">
        <Image
          src={randomHeroPhoto()}
          alt=""
          fill
          priority
          sizes="(min-width: 672px) 672px, 100vw"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <div className="absolute left-0 right-0 bottom-0 px-4 pb-4">
          <p className="font-label font-bold text-xs uppercase tracking-widest text-rose">{today}</p>
          <h1 className="text-5xl text-paper mt-1">Dashboard</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 border-2 border-ink bg-surface">
        {[
          { value: liveCount ?? 0, label: 'Live' },
          { value: conceptCount ?? 0, label: 'Concept' },
          { value: generatedCount ?? 0, label: 'Gemaakt' },
        ].map((stat, i) => (
          <div key={stat.label} className={`px-3 py-3 ${i > 0 ? 'border-l border-line' : ''}`}>
            <p className="sport-number text-5xl">{stat.value}</p>
            <p className="sport-label mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <Link href="/instructor/generate" className="btn-primary w-full flex items-center justify-between">
        <span>Nieuwe training maken</span>
        <span aria-hidden="true" className="text-lg leading-none">→</span>
      </Link>

      <div className="border-t border-ink">
        <Link href="/instructor/bibliotheek" className="flex items-center justify-between py-3.5 border-b border-line group">
          <span className="font-label font-bold text-sm uppercase tracking-wider">Trainingsbibliotheek</span>
          <span aria-hidden="true" className="text-muted group-hover:text-ink transition-colors">→</span>
        </Link>
        <Link href="/instructor/deelnemers" className="flex items-center justify-between py-3.5 border-b border-line group">
          <span className="font-label font-bold text-sm uppercase tracking-wider">Deelnemers</span>
          <span aria-hidden="true" className="text-muted group-hover:text-ink transition-colors">→</span>
        </Link>
        <WhatsAppReminderButton />
      </div>

      {recentWorkouts && recentWorkouts.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-3xl text-ink">Recente trainingen</h2>
            <Link href="/instructor/trainingen" className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink">
              Alle trainingen →
            </Link>
          </div>
          <p className="text-xs text-muted mt-1 mb-3">Veeg een training naar links om hem te verwijderen.</p>
          <div className="space-y-2">
            {recentWorkouts.map((w) => (
              <SwipeToDelete key={w.id} workoutId={w.id} name={splitTitle(w.title).name} confirmFirst={w.published && !w.completed_at}>
              <Link
                href={`/instructor/workout/${w.id}`}
                className="card-sport hover:border-ink transition-colors"
              >
                <div className={`card-sport-bar ${w.completed_at ? 'bg-rose' : w.published ? '' : 'bg-line'}`} />
                <div className="card-sport-body">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-3">
                      <p className="font-display text-xl leading-tight uppercase tracking-wide">{splitTitle(w.title).name}</p>
                      <p className="sport-label mt-1">
                        {formatWorkoutDate(w.created_at)} · {w.duration} min · {w.intensity}
                        {w.completed_at && ` · gedaan ${new Date(w.completed_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}`}
                      </p>
                      {w.created_by && athleteNames[w.created_by] && (
                        <p className="text-sm text-berry mt-1">Gemaakt door {athleteNames[w.created_by]}</p>
                      )}
                      {(w.published && (signupCountByWorkout[w.id] ?? 0) > 0 || avgRating(w.id) !== null) && (
                        <p className="text-sm mt-2">
                          {w.published && (signupCountByWorkout[w.id] ?? 0) > 0 && (
                            <span className="font-bold">{signupCountByWorkout[w.id]} {signupCountByWorkout[w.id] === 1 ? 'deelnemer' : 'deelnemers'}</span>
                          )}
                          {avgRating(w.id) !== null && (
                            <span className="ml-2">
                              <span className="text-gold">{starsDisplay(avgRating(w.id)!)}</span>
                              <span className="text-muted ml-1">{avgRating(w.id)}/5</span>
                            </span>
                          )}
                        </p>
                      )}
                      {commentsForWorkout(w.id).slice(0, 2).map((c, i) => (
                        <p key={i} className="text-sm text-muted mt-1 italic">&ldquo;{c}&rdquo;</p>
                      ))}
                    </div>
                    <span className={w.completed_at ? 'badge-done' : w.published ? 'badge-live' : 'badge-draft'}>
                      {w.completed_at ? 'Gedaan' : w.published ? 'Live' : 'Concept'}
                    </span>
                  </div>
                </div>
              </Link>
              </SwipeToDelete>
            ))}
          </div>
          <Link href="/instructor/trainingen" className="btn-secondary w-full flex items-center justify-between mt-3">
            <span>Alle trainingen bekijken</span>
            <span aria-hidden="true" className="text-lg leading-none">→</span>
          </Link>
        </div>
      )}
    </div>
  )
}
