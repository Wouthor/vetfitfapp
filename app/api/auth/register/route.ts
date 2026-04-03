import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail, sendNewUserNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail en wachtwoord zijn verplicht' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Stuur e-mails op de achtergrond (niet awaiten zodat registratie snel blijft)
  Promise.all([
    sendWelcomeEmail(email).catch(console.error),
    sendNewUserNotification(email).catch(console.error),
  ])

  return NextResponse.json({ user: data.user })
}
