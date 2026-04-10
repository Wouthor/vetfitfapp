import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateWorkout } from '@/lib/claude'
import { truncateForContext } from '@/lib/docx-parser'
import type { Duration, Intensity } from '@/lib/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await request.json()
  const duration = body.duration as Duration
  const intensity = body.intensity as Intensity
  const kneeFriendly = Boolean(body.kneeFriendly)
  const equipment = Array.isArray(body.equipment) ? body.equipment as string[] : []
  const chatfit = typeof body.chatfit === 'string' ? body.chatfit.slice(0, 500) : ''

  if (![30, 45, 60].includes(duration)) {
    return NextResponse.json({ error: 'Ongeldige duur' }, { status: 400 })
  }
  if (!['laag', 'middel', 'hoog'].includes(intensity)) {
    return NextResponse.json({ error: 'Ongeldige intensiteit' }, { status: 400 })
  }

  const adminSupabase = await createAdminClient()

  // Fetch 8 random source workouts as context
  const { data: sourceWorkouts } = await adminSupabase
    .from('source_workouts')
    .select('raw_text, file_name')
    .not('raw_text', 'is', null)
    .limit(50)

  // Pick up to 5 randomly
  const shuffled = (sourceWorkouts ?? []).sort(() => Math.random() - 0.5).slice(0, 5)
  const exampleWorkouts = shuffled
    .filter((w) => w.raw_text)
    .map((w) => truncateForContext(w.raw_text!, 1000))

  try {
    const content = await generateWorkout({ duration, intensity, kneeFriendly, exampleWorkouts, equipment, chatfit })

    const title = `Training ${duration} min · ${intensity}`

    const { data: saved } = await adminSupabase
      .from('generated_workouts')
      .insert({
        created_by: user.id,
        duration,
        intensity,
        knee_friendly: kneeFriendly,
        content,
        title,
        published: false,
      })
      .select('id')
      .single()

    return NextResponse.json({ id: saved?.id, content, title })
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generatie mislukt' },
      { status: 500 }
    )
  }
}
