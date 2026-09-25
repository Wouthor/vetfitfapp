import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function setCompletedAt(id: string, completedAt: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'instructor') return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const adminSupabase = await createAdminClient()
  const { error } = await adminSupabase
    .from('generated_workouts')
    .update({ completed_at: completedAt })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  return setCompletedAt(params.id, new Date().toISOString())
}

// Ongedaan maken: training weer op niet-gedaan zetten
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  return setCompletedAt(params.id, null)
}
