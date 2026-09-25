// Titels worden opgeslagen als "Naam — 21 september 2026"; splits die voor weergave
export function splitTitle(title: string | null | undefined): { name: string; date: string | null } {
  if (!title) return { name: 'Training', date: null }
  const i = title.lastIndexOf(' — ')
  if (i === -1) return { name: title, date: null }
  return { name: title.slice(0, i), date: title.slice(i + 3) }
}

// Aanmaakdatum als korte weergave, bijv. "za 21 sep"
export function formatWorkoutDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Amsterdam' })
}
