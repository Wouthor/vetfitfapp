import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function checkInstructor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'instructor') return null
  return user
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await checkInstructor()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = await request.json()
  const adminSupabase = await createAdminClient()

  const { error } = await adminSupabase
    .from('generated_workouts')
    .update({ content: body.content, title: body.title })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await checkInstructor()
  if (!user) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const adminSupabase = await createAdminClient()
  const { error } = await adminSupabase
    .from('generated_workouts')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
