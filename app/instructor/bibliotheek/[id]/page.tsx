import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createClient } from '@/lib/supabase/server'
import { checkEquipmentFit, isExcluded } from '@/lib/library'
import { categoryLabel } from '@/lib/library-categories'
import CreateFromLibrary from '@/components/CreateFromLibrary'
import type { Duration } from '@/lib/types'

const TYPE_NL: Record<string, string> = {
  'Warm Up': 'Warming-up', Conditioning: 'Conditie', Strength: 'Kracht', HIT: 'HIIT', Cardio: 'Cardio',
  Finisher: 'Afsluiter', Game: 'Spel', 'Fitness Test': 'Test',
}
const FEATURE_NL: Record<string, string> = {
  Circuit: 'Circuit', Bodyweight: 'Lichaamsgewicht', Intervals: 'Intervallen', Partner: 'Partner', Teambuilding: 'Team',
  Gamified: 'Spelvorm', Boxing: 'Boksen', Running: 'Hardlopen', Reps: 'Herhalingen', Agility: 'Wendbaarheid',
}

export default async function LibraryDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: w }, { data: profile }] = await Promise.all([
    supabase.from('library_workouts').select('*').eq('id', params.id).single(),
    supabase.from('profiles').select('equipment').eq('id', user!.id).single(),
  ])
  if (!w) notFound()

  const selected: string[] = profile?.equipment ?? []
  const fit = checkEquipmentFit(w.equipment ?? [], selected)
  const duration = w.duration_min === w.duration_max ? `${w.duration_min} min` : `${w.duration_min}-${w.duration_max} min`
  // Korte blokken (warming-up, afsluiter) worden aangevuld tot 45 minuten; lange trainingen tot 60
  const defaultDuration: Duration = (w.duration_max ?? 0) >= 40 ? 60 : 45
  // De eerste kop is de titel en de afbeeldingen staan niet in de app; die slaan we over
  const body = String(w.markdown).replace(/^# .*\n+/, '')

  return (
    <div className="space-y-5">
      <div>
        <Link href="/instructor/bibliotheek" className="font-label font-bold text-xs uppercase tracking-widest text-muted hover:text-ink">
          ← Bibliotheek
        </Link>
        <p className="sport-label mt-4">{(w.types ?? []).map((t: string) => TYPE_NL[t] ?? t).join(' · ') || 'Training'}</p>
        <h1 className="text-5xl mt-2">{w.title}</h1>
        <div className="grid grid-cols-3 border-y-2 border-ink mt-4">
          <div className="py-2.5"><p className="sport-number text-2xl">{duration}</p><p className="sport-label">duur</p></div>
          <div className="py-2.5 pl-3 border-l border-line"><p className="sport-number text-2xl">{Math.min(...(w.min_group_sizes?.length ? w.min_group_sizes : [1]))}+</p><p className="sport-label">deelnemers</p></div>
          <div className="py-2.5 pl-3 border-l border-line"><p className="sport-number text-2xl">{fit.ok ? 'Ja' : 'Nee'}</p><p className="sport-label">uitvoerbaar</p></div>
        </div>
        {(w.features ?? []).length > 0 && (
          <p className="sport-label mt-2">{(w.features as string[]).map((f) => FEATURE_NL[f] ?? f).join(' · ')}</p>
        )}
      </div>

      <div className={`rounded-sm px-4 py-3 ${fit.ok ? 'bg-blush' : 'bg-red-50 border border-red-300'}`}>
        <p className={`font-label font-bold text-xs uppercase tracking-widest ${fit.ok ? 'text-berry' : 'text-red-700'}`}>
          {fit.ok ? 'Past bij je materiaal' : 'Past niet bij je materiaal'}
        </p>
        {!fit.ok && <p className="text-sm mt-1">Ontbreekt: {fit.missing.join(', ')}. Bij het maken van een training wordt dit zo goed mogelijk vervangen.</p>}
        {fit.notes.length > 0 && <p className="text-sm mt-1">Vervangen: {fit.notes.join('; ')}.</p>}
        {fit.limited.length > 0 && <p className="text-sm mt-1">Let op: {fit.limited.join('; ')}.</p>}
        {w.has_burpees && <p className="text-sm mt-1">Burpees worden automatisch vervangen door een andere oefening.</p>}
        {(w.equipment ?? []).length > 0 && <p className="text-xs text-muted mt-1.5">Origineel materiaal: {(w.equipment as string[]).join(', ')}</p>}
      </div>

      {isExcluded(w) ? (
        <div className="rounded-sm px-4 py-3 bg-sunken border border-line">
          <p className="font-label font-bold text-xs uppercase tracking-widest text-muted">Uitgesloten</p>
          <p className="text-sm mt-1">Deze training bevat {(w.categories as string[]).filter((c) => isExcluded({ categories: [c] })).map(categoryLabel).join(', ').toLowerCase()} en wordt daarom niet gebruikt.</p>
        </div>
      ) : (
        <CreateFromLibrary libraryId={w.id} equipment={selected} defaultDuration={defaultDuration} />
      )}

      {(w.categories ?? []).length > 0 && (
        <div>
          <p className="sport-label mb-1.5">Soorten oefeningen</p>
          <div className="flex flex-wrap -m-0.5">
            {(w.categories as string[]).map((c) => (
              <Link key={c} href={`/instructor/bibliotheek?oefening=${c}`} className="m-0.5 badge-draft hover:border-ink hover:text-ink">{categoryLabel(c)}</Link>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <p className="sport-label mb-3">Originele training (Engels)</p>
        <div className="library-md text-[15px] leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: () => null,
              a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{children}</a>,
              table: ({ children }) => <div className="overflow-x-auto my-3"><table className="w-full text-sm border-collapse">{children}</table></div>,
            }}
          >
            {body}
          </ReactMarkdown>
        </div>
        {w.source_url && (
          <a href={w.source_url} target="_blank" rel="noopener noreferrer" className="btn-ghost inline-block px-0 mt-3">
            Bekijk op BootCraft ↗
          </a>
        )}
      </div>
    </div>
  )
}
