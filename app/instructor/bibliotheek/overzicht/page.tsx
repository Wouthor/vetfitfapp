import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchLibraryMeta } from '@/lib/library-db'
import { isExcluded, isUsable, type LibraryMeta } from '@/lib/library'
import { LIBRARY_CATEGORIES } from '@/lib/library-categories'

// Overzicht per soort oefening: hoeveel bibliotheektrainingen erin vallen en hoeveel er met je materiaal kunnen
export default async function LibraryOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [all, { data: profile }] = await Promise.all([
    fetchLibraryMeta(supabase).catch(() => [] as LibraryMeta[]),
    supabase.from('profiles').select('equipment').eq('id', user!.id).single(),
  ])
  const selected: string[] = profile?.equipment ?? []
  const visible = all.filter((w) => !isExcluded(w))

  const rows = LIBRARY_CATEGORIES.map((c) => {
    const excluded = isExcluded({ categories: [c.id] })
    const inCat = (excluded ? all : visible).filter((w) => (w.categories ?? []).includes(c.id))
    return { c, excluded, total: inCat.length, usable: inCat.filter((w) => isUsable(w, selected)).length }
  }).sort((a, b) => Number(a.excluded) - Number(b.excluded) || b.total - a.total)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/instructor/bibliotheek" className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink">
          ← Bibliotheek
        </Link>
        <h1 className="text-5xl mt-3">Soorten oefeningen</h1>
        <p className="text-muted text-sm mt-1">
          Per soort: in hoeveel van de {visible.length} trainingen hij voorkomt, en hoeveel daarvan haalbaar zijn met het materiaal dat je bij Nieuwe training hebt aangevinkt.
          Een training valt vaak onder meerdere soorten.
        </p>
      </div>

      <div className="border-t-2 border-ink">
        <div className="grid py-2 border-b border-line sport-label" style={{ gridTemplateColumns: 'minmax(0,1fr) 3.5rem 5rem' }}>
          <span>Soort</span>
          <span className="text-right">Totaal</span>
          <span className="text-right">Haalbaar</span>
        </div>
        {rows.map(({ c, excluded, total, usable }) => (
          <Link
            key={c.id}
            href={excluded ? '#' : `/instructor/bibliotheek?oefening=${c.id}`}
            className={`grid items-baseline py-3 border-b border-line ${excluded ? 'opacity-60 cursor-default' : 'hover:bg-surface'}`}
            style={{ gridTemplateColumns: 'minmax(0,1fr) 3.5rem 5rem', fontVariantNumeric: 'tabular-nums' }}
          >
            <span className="pr-3 min-w-0">
              <span className="font-bold block">
                {c.label}
                {excluded && <span className="badge-draft ml-2 align-middle">Uitgesloten</span>}
              </span>
              <span className="text-sm text-muted block leading-snug mt-0.5">{c.description}</span>
            </span>
            <span className="sport-number text-2xl text-right">{total}</span>
            <span className="sport-number text-2xl text-right">{excluded ? '–' : usable}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
