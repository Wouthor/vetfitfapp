import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { splitTitle, formatWorkoutDate } from '@/lib/format'
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
      <div className="relative -mx-4 -mt-6 h-44 overflow-hidden bg-ink">
        <Image
          src="/photos/02-oudere-sporters/03-yoga-in-het-park.jpg"
          alt="Groep sporters traint samen in het park"
          fill
          priority
          sizes="(min-width: 672px) 672px, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        <div className="absolute left-0 right-0 bottom-0 px-4 pb-4">
          <p className="font-label font-bold text-xs uppercase tracking-widest text-sage">Van je instructeur</p>
          <h1 className="text-5xl text-paper mt-1">Trainingen</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/athlete/generate" className="btn-primary text-center text-sm px-3">
          Zelf een training maken
        </Link>
        <Link href="/athlete/profile" className="btn-secondary text-center text-sm px-3">
          Mijn profiel
        </Link>
      </div>

      {upcoming.length === 0 && done.length === 0 && (
        <div className="border-2 border-dashed border-line px-5 py-10 text-center">
          <p className="font-display text-2xl uppercase">Nog geen trainingen</p>
          <p className="text-muted text-sm mt-1">Zodra je instructeur een training publiceert, zie je hem hier.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-3xl text-ink mb-3">Aankomend</h2>
          <div className="space-y-2">
            {upcoming.map((w) => {
              const count = countByWorkout[w.id] ?? 0
              const iJoin = signedUpIds.has(w.id)
              return (
                <div key={w.id} className="card-sport hover:border-ink transition-colors">
                  <div className="card-sport-bar" />
                  <div className="card-sport-body">
                    <Link href={`/athlete/workout/${w.id}`} className="flex items-start justify-between">
                      <div className="min-w-0 pr-3">
                        <p className="font-display text-xl leading-tight uppercase tracking-wide">{splitTitle(w.title).name}</p>
                        <p className="sport-label mt-1">
                          {formatWorkoutDate(w.created_at)} · {w.duration} min · {w.intensity}{w.knee_friendly ? ' · knievriendelijk' : ''}
                        </p>
                      </div>
                      <span aria-hidden="true" className="text-muted flex-shrink-0">→</span>
                    </Link>
                    <div className="mt-3">
                      <InlineSignupButton workoutId={w.id} isSignedUp={iJoin} count={count} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h2 className="text-3xl text-ink mb-3">Gedaan</h2>
          <div className="border-t border-ink">
            {done.map((w) => (
              <Link
                key={w.id}
                href={`/athlete/workout/${w.id}`}
                className="flex items-center justify-between py-3 border-b border-line group"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-bold leading-tight truncate">{splitTitle(w.title).name}</p>
                  <p className="sport-label mt-0.5">
                    {w.duration} min · {new Date(w.completed_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="badge-done">Gedaan</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
