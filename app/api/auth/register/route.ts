export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail, sendNewUserNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail en wachtwoord zijn verplicht' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Naam opslaan in profiel (trigger maakt het profiel aan, wij updaten de naam)
  if (data.user && name) {
    await supabase
      .from('profiles')
      .update({ name })
      .eq('id', data.user.id)
  }

  // Stuur e-mails — moet gewacht worden anders stopt Vercel de functie te vroeg
  await Promise.all([
    sendWelcomeEmail(email).catch(console.error),
    sendNewUserNotification(email).catch(console.error),
  ])

  return NextResponse.json({ user: data.user })
}
