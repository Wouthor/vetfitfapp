import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'instructor') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const adminSupabase = await createAdminClient()
  const { error } = await adminSupabase
    .from('source_workouts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // delete all

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
