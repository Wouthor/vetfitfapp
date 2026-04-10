import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WorkoutDisplay from '@/components/WorkoutDisplay'
import PDFExportButton from '@/components/PDFExportButton'
import type { GeneratedWorkout } from '@/lib/types'
import PublishButton from '@/components/PublishButton'
import CompleteButton from '@/components/CompleteButton'
import DeleteWorkoutButton from '@/components/DeleteWorkoutButton'

export default async function WorkoutDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: workout }, { data: signups }, { data: ratings }] = await Promise.all([
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
  ])

  if (!workout) notFound()

  const w = workout as GeneratedWorkout
  const participants = signups?.map((s: any) => s.profiles?.name).filter(Boolean) ?? []
  const ratingList = ratings ?? []
  const avgRating = ratingList.length
    ? Math.round((ratingList.reduce((a, r) => a + r.rating, 0) / ratingList.length) * 10) / 10
    : null

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{w.title ?? 'Training'}</h1>
          <p className="text-gray-400 mt-1">
            {w.duration} min · {w.intensity}
            {w.knee_friendly ? ' · knie-vriendelijk' : ''}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
          w.published ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400'
        }`}>
          {w.published ? 'Gepubliceerd' : 'Concept'}
        </span>
      </div>

      {participants.length > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-white mb-2">
            Deelnemers ({participants.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {participants.map((name, i) => (
              <span key={i} className="text-xs bg-magenta-900/40 border border-magenta-700 text-magenta-300 px-2 py-1 rounded-full">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {ratingList.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Beoordelingen</p>
            <span className="text-neon-400 font-bold">
              {'★'.repeat(Math.round(avgRating!))}{'☆'.repeat(5 - Math.round(avgRating!))} {avgRating}/5
            </span>
          </div>
          <div className="space-y-3">
            {ratingList.map((r: any, i: number) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#ff99ff]">{r.profiles?.name ?? 'Onbekend'}</span>
                  <span className="text-neon-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && (
                  <p className="text-xs text-[#ff99ff] opacity-70 italic">"{r.comment}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <WorkoutDisplay workout={w.content} showKneeAlternatives={true} />

      <div className="flex gap-3">
        <PDFExportButton workout={w.content} title={w.title ?? 'Training'} />
        {!w.published && <PublishButton workoutId={w.id} />}
      </div>
      <CompleteButton workoutId={w.id} completedAt={w.completed_at ?? null} />
      <DeleteWorkoutButton workoutId={w.id} />
    </div>
  )
}
