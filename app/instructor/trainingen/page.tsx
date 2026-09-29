import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { splitTitle, formatWorkoutDate } from '@/lib/format'
import SwipeToDelete from '@/components/SwipeToDelete'

type Row = {
  id: string
  title: string
  duration: number
  intensity: string
  published: boolean
  completed_at: string | null
  created_at: string
  created_by: string | null
}

export default async function AllWorkoutsPage() {
  const supabase = await createClient()

  const [{ data: workouts }, { data: athletes }] = await Promise.all([
    supabase
      .from('generated_workouts')
      .select('id, title, duration, intensity, published, completed_at, created_at, created_by')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'athlete'),
  ])

  const athleteNames: Record<string, string> = {}
  for (const a of athletes ?? []) athleteNames[a.id] = a.name ?? 'een sporter'

  const rows = (workouts ?? []) as Row[]
  const groups = [
    { title: 'Concept', items: rows.filter((w) => !w.published && !w.completed_at) },
    { title: 'Live', items: rows.filter((w) => w.published && !w.completed_at) },
    { title: 'Gedaan', items: rows.filter((w) => w.completed_at) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <Link href="/instructor" className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="text-5xl mt-3">Alle trainingen</h1>
        <p className="text-muted text-sm mt-1">{rows.length} trainingen, nieuwste bovenaan. Veeg een training naar links om hem te verwijderen.</p>
      </div>

      {groups.map((g) => g.items.length > 0 && (
        <div key={g.title}>
          <h2 className="text-3xl text-ink mb-2">
            {g.title} <span className="text-faint text-2xl">{g.items.length}</span>
          </h2>
          <div className="border-t border-ink">
            {g.items.map((w) => (
              <SwipeToDelete key={w.id} workoutId={w.id} name={splitTitle(w.title).name} confirmFirst={w.published && !w.completed_at} className="bg-paper">
              <Link
                href={`/instructor/workout/${w.id}`}
                className="flex items-center justify-between py-3 border-b border-line group"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-bold leading-tight">{splitTitle(w.title).name}</p>
                  <p className="sport-label mt-0.5">
                    {formatWorkoutDate(w.created_at)} · {w.duration} min · {w.intensity}
                  </p>
                  {w.created_by && athleteNames[w.created_by] && (
                    <p className="text-sm text-berry mt-0.5">Gemaakt door {athleteNames[w.created_by]}</p>
                  )}
                </div>
                <span aria-hidden="true" className="text-muted group-hover:text-ink transition-colors flex-shrink-0">→</span>
              </Link>
              </SwipeToDelete>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
