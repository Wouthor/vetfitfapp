import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateWorkout, type LibraryPromptItem } from '@/lib/claude'
import { pickLibraryCandidates, checkEquipmentFit } from '@/lib/library'
import { fetchLibraryMeta } from '@/lib/library-db'
import { truncateForContext } from '@/lib/docx-parser'
import type { Duration, Intensity } from '@/lib/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await request.json()
  const duration = body.duration as Duration
  const intensity = body.intensity as Intensity
  const kneeFriendly = Boolean(body.kneeFriendly)
  const equipment = Array.isArray(body.equipment) ? body.equipment as string[] : []
  const chatfit = typeof body.chatfit === 'string' ? body.chatfit.slice(0, 500) : ''
  const useWebSearch = Boolean(body.useWebSearch)
  const useLibrary = body.useLibrary !== false
  const requiredLibraryIds = Array.isArray(body.libraryIds) ? (body.libraryIds as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 3) : []

  if (![30, 45, 60].includes(duration)) {
    return NextResponse.json({ error: 'Ongeldige duur' }, { status: 400 })
  }
  if (!['laag', 'middel', 'hoog'].includes(intensity)) {
    return NextResponse.json({ error: 'Ongeldige intensiteit' }, { status: 400 })
  }

  const adminSupabase = await createAdminClient()

  // Fetch 8 random source workouts as context
  const { data: sourceWorkouts } = await adminSupabase
    .from('source_workouts')
    .select('raw_text, file_name')
    .not('raw_text', 'is', null)
    .limit(50)

  // Bibliotheek: kies passende trainingen op duur en materiaal (zonder AI), haal daarna pas de volledige tekst op
  let library: LibraryPromptItem[] = []
  if (useLibrary || requiredLibraryIds.length) {
    try {
      const meta = await fetchLibraryMeta(adminSupabase)
      const picked = pickLibraryCandidates(meta, { duration, selected: equipment, requiredIds: requiredLibraryIds })
      if (picked.length) {
        const { data: texts } = await adminSupabase
          .from('library_workouts')
          .select('id, markdown')
          .in('id', picked.map((p) => p.meta.id))
        const textById = new Map((texts ?? []).map((t) => [t.id as string, t.markdown as string]))
        library = picked.map(({ meta, role, required }) => {
          const fit = checkEquipmentFit(meta.equipment, equipment)
          return {
            id: meta.id, title: meta.title, role, required, durationLabel: meta.duration_label,
            markdown: textById.get(meta.id) ?? '', notes: fit.notes, limited: fit.limited,
          }
        }).filter((l) => l.markdown)
      }
    } catch (err) {
      // Zonder bibliotheek kan er nog steeds een training gemaakt worden
      console.error('Bibliotheek niet beschikbaar:', err)
    }
  }

  // Eigen Drive-trainingen: minder als de bibliotheek meedoet, zodat de prompt compact blijft
  const shuffled = (sourceWorkouts ?? []).sort(() => Math.random() - 0.5).slice(0, library.length ? 3 : 5)
  const exampleWorkouts = shuffled
    .filter((w) => w.raw_text)
    .map((w) => truncateForContext(w.raw_text!, 1000))

  try {
    const { content, title: generatedTitle, sourceLibraryIds } = await generateWorkout({ duration, intensity, kneeFriendly, exampleWorkouts, equipment, chatfit, useWebSearch, library })

    const now = new Date()
    const dateStr = now.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
    const title = `${generatedTitle} — ${dateStr}`

    const row = {
      created_by: user.id,
      duration,
      intensity,
      knee_friendly: kneeFriendly,
      content,
      title,
      published: false,
    }
    let { data: saved, error: saveError } = await adminSupabase
      .from('generated_workouts')
      .insert({ ...row, source_library_ids: sourceLibraryIds })
      .select('id')
      .single()
    if (saveError) {
      // Bijvoorbeeld als de migratie voor source_library_ids nog niet gedraaid is: sla dan zonder bronnen op
      console.error('Opslaan met bronnen mislukt, opnieuw zonder:', saveError.message)
      ;({ data: saved, error: saveError } = await adminSupabase.from('generated_workouts').insert(row).select('id').single())
    }
    if (saveError) throw new Error(`Training kon niet worden opgeslagen: ${saveError.message}`)

    return NextResponse.json({ id: saved?.id, content, title })
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generatie mislukt' },
      { status: 500 }
    )
  }
}
