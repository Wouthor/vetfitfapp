import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { WorkoutPDFDocument } from '@/components/WorkoutPDF'
import { createClient } from '@/lib/supabase/server'
import type { WorkoutContent } from '@/lib/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { workout, title, duration, intensity, showKnee } = await request.json() as {
    workout: WorkoutContent
    title: string
    duration?: number
    intensity?: string
    showKnee?: boolean
  }

  const buffer = await renderToBuffer(
    React.createElement(WorkoutPDFDocument, { workout, title, duration, intensity, showKnee: showKnee !== false })
  )

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(title || 'training')}.pdf"`,
    },
  })
}
