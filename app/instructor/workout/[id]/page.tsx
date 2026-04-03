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

  const { data: workout } = await supabase
    .from('generated_workouts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!workout) notFound()

  const w = workout as GeneratedWorkout

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
