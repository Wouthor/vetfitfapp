import { NextRequest, NextResponse } from 'next/server'
import { sendFridayReminder } from '@/lib/email'

export async function GET(request: NextRequest) {
  // Controleer het geheime token zodat alleen Vercel Cron dit kan aanroepen
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })
  }

  try {
    await sendFridayReminder()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reminder error:', err)
    return NextResponse.json({ error: 'Mislukt' }, { status: 500 })
  }
}
