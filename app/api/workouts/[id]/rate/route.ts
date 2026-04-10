import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { rating, comment } = await req.json()
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Ongeldige rating' }, { status: 400 })
  }

  const { error } = await supabase
    .from('training_ratings')
    .upsert(
      { workout_id: params.id, user_id: user.id, rating, comment: comment ?? null, updated_at: new Date().toISOString() },
      { onConflict: 'workout_id,user_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
