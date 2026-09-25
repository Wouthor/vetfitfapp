import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fetchLibraryMeta } from '@/lib/library-db'
import { checkEquipmentFit, type LibraryMeta } from '@/lib/library'

const SOORTEN: Record<string, { label: string; match: (w: LibraryMeta) => boolean }> = {
  'warming-up': { label: 'Warming-up', match: (w) => w.types.includes('Warm Up') },
  hoofd: { label: 'Hoofdtraining', match: (w) => ['Conditioning', 'Strength', 'HIT', 'Cardio'].some((t) => w.types.includes(t)) && !w.types.includes('Warm Up') },
  afsluiter: { label: 'Afsluiter', match: (w) => w.types.includes('Finisher') },
  spel: { label: 'Spel', match: (w) => w.types.includes('Game') },
}

const DUREN: Record<string, { label: string; lo: number; hi: number }> = {
  kort: { label: 'Tot 10 min', lo: 0, hi: 10 },
  middel: { label: '15-29 min', lo: 15, hi: 29 },
  lang: { label: '30-49 min', lo: 30, hi: 49 },
  heel: { label: '50+ min', lo: 50, hi: 999 },
}

const VORMEN: Record<string, { label: string; feature: string }> = {
  partner: { label: 'Partner', feature: 'Partner' },
  team: { label: 'Team', feature: 'Teambuilding' },
  circuit: { label: 'Circuit', feature: 'Circuit' },
  interval: { label: 'Intervallen', feature: 'Intervals' },
  spel: { label: 'Spelvorm', feature: 'Gamified' },
  hardlopen: { label: 'Hardlopen', feature: 'Running' },
  boksen: { label: 'Boksen', feature: 'Boxing' },
}

const TYPE_NL: Record<string, string> = {
  'Warm Up': 'Warming-up', Conditioning: 'Conditie', Strength: 'Kracht', HIT: 'HIIT', Cardio: 'Cardio',
  Finisher: 'Afsluiter', Game: 'Spel', 'Fitness Test': 'Test',
}

const PER_PAGE = 30

// Sorteer op de eerste letter of cijfer, niet op aanhalingstekens of haakjes
const sortKey = (title: string) => title.replace(/^[^A-Za-z0-9À-ÿ]+/, '').toLowerCase()

function durationText(w: LibraryMeta) {
  if (w.duration_min == null) return null
  return w.duration_min === w.duration_max ? `${w.duration_min} min` : `${w.duration_min}-${w.duration_max} min`
}

export default async function LibraryPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [all, { data: profile }] = await Promise.all([
    fetchLibraryMeta(supabase).catch(() => [] as LibraryMeta[]),
    supabase.from('profiles').select('equipment').eq('id', user!.id).single(),
  ])
  const selected: string[] = profile?.equipment ?? []

  const q = (searchParams.q ?? '').trim().toLowerCase()
  const soort = searchParams.soort && SOORTEN[searchParams.soort] ? searchParams.soort : ''
  const duur = searchParams.duur && DUREN[searchParams.duur] ? searchParams.duur : ''
  const vorm = searchParams.vorm && VORMEN[searchParams.vorm] ? searchParams.vorm : ''
  const alles = searchParams.alles === '1'
  const shown = Math.max(PER_PAGE, Number(searchParams.n) || PER_PAGE)

  const rows = all
    .map((w) => ({ w, fit: checkEquipmentFit(w.equipment, selected) }))
    .filter(({ w, fit }) =>
      (alles || fit.ok) &&
      (!soort || SOORTEN[soort].match(w)) &&
      (!duur || ((w.duration_min ?? 0) <= DUREN[duur].hi && (w.duration_max ?? 999) >= DUREN[duur].lo)) &&
      (!vorm || w.features.includes(VORMEN[vorm].feature)) &&
      (!q || w.title.toLowerCase().includes(q) || w.tags.some((t) => t.toLowerCase().includes(q)))
    )
    .sort((a, b) => sortKey(a.w.title).localeCompare(sortKey(b.w.title)))

  const params = (extra: Record<string, string>) => {
    const p = new URLSearchParams()
    const base: Record<string, string> = { q: searchParams.q ?? '', soort, duur, vorm, alles: alles ? '1' : '' }
    for (const [k, v] of Object.entries({ ...base, ...extra })) if (v) p.set(k, v)
    return `?${p.toString()}`
  }

  const selectClass = 'input py-2.5 px-2 text-sm'

  return (
    <div className="space-y-6">
      <div>
        <Link href="/instructor" className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="text-5xl mt-3">Bibliotheek</h1>
        <p className="text-muted text-sm mt-1">
          {all.length} trainingen uit BootCraft. Kies er een en maak er in één keer een complete training van, vertaald en aangepast aan je materiaal.
        </p>
      </div>

      {all.length === 0 && (
        <div className="border-2 border-dashed border-line px-5 py-10 text-center">
          <p className="font-display text-2xl uppercase">Bibliotheek is leeg</p>
          <p className="text-muted text-sm mt-1">De trainingen zijn nog niet geïmporteerd.</p>
        </div>
      )}

      {all.length > 0 && (
        <form method="get" className="card space-y-3">
          <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Zoek op naam of tag, bijv. tabata" className="input" />
          <div className="grid grid-cols-3 gap-2">
            <select name="soort" defaultValue={soort} className={selectClass} aria-label="Soort">
              <option value="">Soort</option>
              {Object.entries(SOORTEN).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select name="duur" defaultValue={duur} className={selectClass} aria-label="Duur">
              <option value="">Duur</option>
              {Object.entries(DUREN).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select name="vorm" defaultValue={vorm} className={selectClass} aria-label="Vorm">
              <option value="">Vorm</option>
              {Object.entries(VORMEN).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <label className="flex items-center text-sm">
            <input type="checkbox" name="alles" value="1" defaultChecked={alles} className="mr-2 w-4 h-4 accent-[#12261e]" />
            Ook trainingen tonen die niet passen bij mijn materiaal
          </label>
          <button type="submit" className="btn-primary w-full">Filteren</button>
        </form>
      )}

      {all.length > 0 && (
        <div>
          <p className="sport-label mb-2">{rows.length} {rows.length === 1 ? 'training' : 'trainingen'}</p>
          <div className="space-y-2">
            {rows.slice(0, shown).map(({ w, fit }) => (
              <Link key={w.id} href={`/instructor/bibliotheek/${w.id}`} className="card-sport hover:border-ink transition-colors">
                <div className={`card-sport-bar ${fit.ok ? '' : 'bg-line'}`} />
                <div className="card-sport-body">
                  <p className="font-display text-xl leading-tight uppercase tracking-wide">{w.title}</p>
                  <p className="sport-label mt-1">
                    {[durationText(w), ...w.types.map((t) => TYPE_NL[t] ?? t)].filter(Boolean).join(' · ')}
                  </p>
                  <div className="flex flex-wrap -m-0.5 mt-1.5">
                    {!fit.ok && <span className="m-0.5 badge-draft">Mist: {fit.missing.slice(0, 2).join(', ')}</span>}
                    {fit.ok && fit.limited.length > 0 && <span className="m-0.5 badge-draft">Stations</span>}
                    {fit.ok && fit.notes.length > 0 && <span className="m-0.5 badge-draft">Materiaal vervangen</span>}
                    {w.features.includes('Partner') && <span className="m-0.5 badge-draft">Partner</span>}
                    {w.features.includes('Teambuilding') && <span className="m-0.5 badge-draft">Team</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {rows.length > shown && (
            <Link href={params({ n: String(shown + PER_PAGE) })} scroll={false} className="btn-secondary w-full text-center block mt-3">
              Meer tonen ({rows.length - shown} over)
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
