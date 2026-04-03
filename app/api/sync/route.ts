import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { listDocxFilesRecursive, downloadFileAsBuffer, exportGoogleDocAsText } from '@/lib/google-drive'
import { extractTextFromDocx } from '@/lib/docx-parser'

export async function POST() {
  // Check auth + instructor role
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

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
  if (!folderId) {
    return NextResponse.json({ error: 'GOOGLE_DRIVE_FOLDER_ID niet ingesteld' }, { status: 500 })
  }

  const adminSupabase = await createAdminClient()

  try {
    // List all files recursively
    const files = await listDocxFilesRecursive(folderId)

    let synced = 0
    let skipped = 0
    const errors: string[] = []

    for (const file of files) {
      try {
        // Check if already synced
        const { data: existing } = await adminSupabase
          .from('source_workouts')
          .select('id')
          .eq('drive_file_id', file.id)
          .maybeSingle()

        if (existing) {
          skipped++
          continue
        }

        // Download and parse
        let rawText: string
        if (file.mimeType === 'application/vnd.google-apps.document') {
          rawText = await exportGoogleDocAsText(file.id)
        } else {
          const buffer = await downloadFileAsBuffer(file.id)
          rawText = await extractTextFromDocx(buffer)
        }

        const { error: insertError } = await supabase.from('source_workouts').insert({
          drive_file_id: file.id,
          file_name: file.name,
          raw_text: rawText,
          parsed_content: null,
        })

        if (insertError) {
          errors.push(`${file.name}: ${insertError.message}`)
        } else {
          synced++
        }
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : 'Onbekende fout'}`)
      }
    }

    return NextResponse.json({
      total: files.length,
      synced,
      skipped,
      errors,
    })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync mislukt' },
      { status: 500 }
    )
  }
}
