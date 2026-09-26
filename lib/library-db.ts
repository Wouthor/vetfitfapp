import type { SupabaseClient } from '@supabase/supabase-js'
import type { LibraryMeta } from './library'

export const LIBRARY_META_COLUMNS = 'id, title, duration_label, duration_min, duration_max, types, features, equipment, tags, has_burpees, categories'

// Supabase geeft maximaal 1000 rijen per verzoek; haal de bibliotheek in delen op
export async function fetchLibraryMeta(supabase: SupabaseClient): Promise<LibraryMeta[]> {
  const out: LibraryMeta[] = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('library_workouts')
      .select(LIBRARY_META_COLUMNS)
      .order('id')
      .range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    out.push(...((data ?? []) as LibraryMeta[]))
    if (!data || data.length < PAGE) break
  }
  return out
}
