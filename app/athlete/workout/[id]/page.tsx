import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WorkoutDisplay from '@/components/WorkoutDisplay'
import PDFExportButton from '@/components/PDFExportButton'
import SignupButton from '@/components/SignupButton'
import StarRating from '@/components/StarRating'
import { splitTitle } from '@/lib/format'
import type { GeneratedWorkout } from '@/lib/types'
import Link from 'next/link'

export default async function AthleteWorkoutDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: workout }, { data: signups }, { data: myRating }] = await Promise.all([
    supabase
      .from('generated_workouts')
      .select('*')
      .eq('id', params.id)
      .eq('published', true)
      .single(),
    supabase
      .from('training_signups')
      .select('user_id, profiles(name)')
      .eq('workout_id', params.id),
    supabase
      .from('training_ratings')
      .select('rating, comment')
      .eq('workout_id', params.id)
      .eq('user_id', user?.id ?? '')
      .maybeSingle(),
  ])

  if (!workout) notFound()

  const w = workout as GeneratedWorkout
  const isSignedUp = signups?.some((s) => s.user_id === user?.id) ?? false
  const participants = signups?.map((s: any) => s.profiles?.name).filter(Boolean) ?? []

  const { name } = splitTitle(w.title)
  const date = new Date(w.created_at).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' })

  return (
    <div className="space-y-5">
      <div>
        <Link href="/athlete" className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink">
          ← Trainingen
        </Link>
        {date && <p className="sport-label mt-4">{date}</p>}
        <h1 className="text-5xl mt-2">{name}</h1>
        <div className="grid grid-cols-3 border-y-2 border-ink mt-4">
          <div className="py-2.5"><p className="sport-number text-3xl">{w.duration}</p><p className="sport-label">minuten</p></div>
          <div className="py-2.5 pl-3 border-l border-line"><p className="sport-number text-3xl capitalize">{w.intensity}</p><p className="sport-label">intensiteit</p></div>
          <div className="py-2.5 pl-3 border-l border-line"><p className="sport-number text-3xl">{participants.length}</p><p className="sport-label">{participants.length === 1 ? 'doet mee' : 'doen mee'}</p></div>
        </div>
        {w.knee_friendly && <p className="sport-label text-berry mt-2">Knievriendelijk</p>}
      </div>

      <SignupButton workoutId={w.id} isSignedUp={isSignedUp} />

      {participants.length > 0 && (
        <div>
          <p className="sport-label mb-2">Wie doen er mee</p>
          <div className="flex flex-wrap -m-1">
            {participants.map((name, i) => (
              <span key={i} className="m-1 text-sm bg-surface border border-line px-2.5 py-1 rounded-sm">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <WorkoutDisplay workout={w.content} showKneeAlternatives={w.knee_friendly} />

      <PDFExportButton workout={w.content} title={w.title ?? 'Training'} duration={w.duration} intensity={w.intensity} showKnee={w.knee_friendly} />
      <StarRating workoutId={w.id} initialRating={myRating?.rating ?? null} initialComment={myRating?.comment ?? null} />
    </div>
  )
}
