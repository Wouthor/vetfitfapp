import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import WorkoutDisplay from '@/components/WorkoutDisplay'
import WorkoutEditToggle from '@/components/WorkoutEditToggle'
import PDFExportButton from '@/components/PDFExportButton'
import type { GeneratedWorkout } from '@/lib/types'
import { splitTitle } from '@/lib/format'
import PublishButton from '@/components/PublishButton'
import CompleteButton from '@/components/CompleteButton'
import DeleteWorkoutButton from '@/components/DeleteWorkoutButton'

export default async function WorkoutDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: workout }, { data: signups }, { data: ratings }, { data: profile }] = await Promise.all([
    supabase
      .from('generated_workouts')
      .select('*')
      .eq('id', params.id)
      .single(),
    supabase
      .from('training_signups')
      .select('user_id, profiles(name)')
      .eq('workout_id', params.id),
    supabase
      .from('training_ratings')
      .select('rating, comment, profiles(name)')
      .eq('workout_id', params.id),
    user
      ? supabase.from('profiles').select('equipment').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  if (!workout) notFound()

  const sourceIds: string[] = (workout as GeneratedWorkout).source_library_ids ?? []
  const { data: sources } = sourceIds.length
    ? await supabase.from('library_workouts').select('id, title').in('id', sourceIds)
    : { data: [] as { id: string; title: string }[] }

  const w = workout as GeneratedWorkout
  const participants = signups?.map((s: any) => s.profiles?.name).filter(Boolean) ?? []
  const ratingList = ratings ?? []
  const avgRating = ratingList.length
    ? Math.round((ratingList.reduce((a, r) => a + r.rating, 0) / ratingList.length) * 10) / 10
    : null

  const { name } = splitTitle(w.title)
  const date = new Date(w.created_at).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' })

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <p className="sport-label">{date ?? 'Training'}</p>
          <span className={w.completed_at ? 'badge-done' : w.published ? 'badge-live' : 'badge-draft'}>
            {w.completed_at ? 'Gedaan' : w.published ? 'Live' : 'Concept'}
          </span>
        </div>
        <h1 className="text-5xl mt-2">{name}</h1>
        <div className="grid grid-cols-3 border-y-2 border-ink mt-4">
          <div className="py-2.5"><p className="sport-number text-3xl">{w.duration}</p><p className="sport-label">minuten</p></div>
          <div className="py-2.5 pl-3 border-l border-line"><p className="sport-number text-3xl capitalize">{w.intensity}</p><p className="sport-label">intensiteit</p></div>
          <div className="py-2.5 pl-3 border-l border-line"><p className="sport-number text-3xl">{participants.length}</p><p className="sport-label">{participants.length === 1 ? 'deelnemer' : 'deelnemers'}</p></div>
        </div>
        {w.knee_friendly && <p className="sport-label text-moss mt-2">Knievriendelijk</p>}
      </div>

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

      {ratingList.length > 0 && (
        <div className="card">
          <div className="flex items-baseline justify-between">
            <p className="sport-label">Beoordelingen</p>
            <p>
              <span className="text-gold">{'★'.repeat(Math.round(avgRating!))}{'☆'.repeat(5 - Math.round(avgRating!))}</span>
              <span className="font-bold ml-1.5">{avgRating}/5</span>
            </p>
          </div>
          <div className="mt-2">
            {ratingList.map((r: any, i: number) => (
              <div key={i} className="py-2.5 border-t border-line">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.profiles?.name ?? 'Onbekend'}</span>
                  <span className="text-gold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && (
                  <p className="text-sm text-muted italic mt-0.5">&ldquo;{r.comment}&rdquo;</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div>
          <p className="sport-label mb-1.5">Gebaseerd op uit de bibliotheek</p>
          <div className="flex flex-wrap -m-1">
            {sources.map((src) => (
              <Link key={src.id} href={`/instructor/bibliotheek/${src.id}`} className="m-1 text-sm bg-surface border border-line hover:border-ink px-2.5 py-1 rounded-sm transition-colors">
                {src.title} →
              </Link>
            ))}
          </div>
        </div>
      )}

      <WorkoutEditToggle
        workoutId={w.id}
        content={w.content}
        intensity={w.intensity}
        kneeFriendly={w.knee_friendly}
        equipment={profile?.equipment ?? []}
      />

      <WorkoutDisplay workout={w.content} showKneeAlternatives={true} />

      <div className="flex space-x-3">
        <PDFExportButton workout={w.content} title={w.title ?? 'Training'} duration={w.duration} intensity={w.intensity} showKnee={true} />
        {!w.published && <PublishButton workoutId={w.id} />}
      </div>
      <CompleteButton workoutId={w.id} completedAt={w.completed_at ?? null} />
      <DeleteWorkoutButton workoutId={w.id} />
    </div>
  )
}
