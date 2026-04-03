import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { WorkoutPDFDocument } from '@/components/WorkoutPDF'
import type { WorkoutContent } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { workout, title } = await request.json() as { workout: WorkoutContent; title: string }

  const buffer = await renderToBuffer(
    React.createElement(WorkoutPDFDocument, { workout, title })
  )

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(title || 'training')}.pdf"`,
    },
  })
}
