// Importeert de BootCraft-trainingen uit bootcraft-app-data/ in de tabel library_workouts.
// Gebruik (vanuit bootcamp-app):  npx tsx scripts/import-library.ts
// Leest NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY uit .env.local.
// Opnieuw draaien is veilig: bestaande trainingen worden bijgewerkt (upsert op id).

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.join(process.cwd(), 'bootcraft-app-data')

function loadEnv() {
  const file = path.join(process.cwd(), '.env.local')
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

interface IndexEntry {
  id: string
  title: string
  markdown: string
  source_url: string
  duration_label: string
  duration_ranges_minutes: { min: number; max: number }[]
  minimum_group_sizes: number[]
  types: string[]
  features: string[]
  equipment: string[]
  tags: string[]
  designer: string | null
  links: { label: string; url: string }[]
}

async function main() {
  loadEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt in .env.local')
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'index.json'), 'utf8')) as { trainings: IndexEntry[] }
  const rows = index.trainings.map((t) => {
    const markdown = fs.readFileSync(path.join(ROOT, t.markdown), 'utf8')
    const ranges = t.duration_ranges_minutes ?? []
    return {
      id: t.id,
      title: t.title,
      source_url: t.source_url,
      duration_label: t.duration_label,
      duration_min: ranges.length ? Math.min(...ranges.map((r) => r.min)) : null,
      duration_max: ranges.length ? Math.max(...ranges.map((r) => r.max)) : null,
      duration_ranges: ranges,
      min_group_sizes: t.minimum_group_sizes ?? [],
      types: t.types ?? [],
      features: t.features ?? [],
      equipment: t.equipment ?? [],
      tags: t.tags ?? [],
      designer: t.designer ?? null,
      markdown,
      links: t.links ?? [],
      has_burpees: /burpee/i.test(markdown),
    }
  })

  const BATCH = 100
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase.from('library_workouts').upsert(rows.slice(i, i + BATCH), { onConflict: 'id' })
    if (error) throw new Error(`Batch ${i / BATCH + 1}: ${error.message}`)
    process.stdout.write(`\r${Math.min(i + BATCH, rows.length)}/${rows.length} geïmporteerd`)
  }
  const { count } = await supabase.from('library_workouts').select('*', { count: 'exact', head: true })
  console.log(`\nKlaar. ${count} trainingen in de bibliotheek.`)
}

main().catch((err) => {
  console.error('\nImport mislukt:', err.message)
  process.exit(1)
})
