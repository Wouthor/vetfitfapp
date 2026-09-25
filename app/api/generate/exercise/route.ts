import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateExerciseAlternative } from '@/lib/claude'
import type { Exercise, Intensity } from '@/lib/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'instructor') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = await request.json()
  const sectionLabel = typeof body.sectionLabel === 'string' ? body.sectionLabel : 'training'
  const currentExercise = body.currentExercise as Exercise
  const equipment = Array.isArray(body.equipment) ? body.equipment as string[] : []
  const kneeFriendly = Boolean(body.kneeFriendly)
  const intensity = (body.intensity as Intensity) ?? 'middel'

  if (!currentExercise?.naam) {
    return NextResponse.json({ error: 'Geen oefening meegegeven' }, { status: 400 })
  }

  try {
    const exercise = await generateExerciseAlternative({ sectionLabel, currentExercise, equipment, kneeFriendly, intensity })
    return NextResponse.json({ exercise })
  } catch (err) {
    console.error('Exercise alternative error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Genereren mislukt' },
      { status: 500 }
    )
  }
}
