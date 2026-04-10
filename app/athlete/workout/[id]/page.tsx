import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import WorkoutDisplay from '@/components/WorkoutDisplay'
import PDFExportButton from '@/components/PDFExportButton'
import CompleteButton from '@/components/CompleteButton'
import SignupButton from '@/components/SignupButton'
import StarRating from '@/components/StarRating'
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

  return (
    <div className="space-y-5">
      <div>
        <Link href="/athlete" className="text-sm text-[#ff99ff] hover:text-white mb-2 inline-block">
          ← Terug
        </Link>
        <h1 className="text-2xl font-bold text-white">{w.title ?? 'Training'}</h1>
        <p className="text-[#ff99ff] mt-1">
          {w.duration} min · {w.intensity}
          {w.knee_friendly ? ' · knie-vriendelijk' : ''}
        </p>
      </div>

      <SignupButton workoutId={w.id} isSignedUp={isSignedUp} />

      {participants.length > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-white mb-2">
            Wie doen er mee? ({participants.length})
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

      <WorkoutDisplay workout={w.content} showKneeAlternatives={w.knee_friendly} />

      <PDFExportButton workout={w.content} title={w.title ?? 'Training'} />
      <CompleteButton workoutId={w.id} completedAt={w.completed_at ?? null} />
      <StarRating workoutId={w.id} initialRating={myRating?.rating ?? null} initialComment={myRating?.comment ?? null} />
    </div>
  )
}
