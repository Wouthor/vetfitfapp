import type { Duration } from './types'

// ── Materiaal: BootCraft-benaming → wat de instructeur heeft ────────────────
// have:  uitvoerbaar als een van de app-materialen in `anyOf` is geselecteerd
// small: klein of alledaags spelmateriaal; altijd uitvoerbaar, met een aanwijzing
// never: niet aanwezig en niet te vervangen; training valt af
// `limited`: er is maar één of een paar van, dus werken in stations

type EquipmentRule =
  | { kind: 'have'; anyOf: string[]; note?: string; limited?: string }
  | { kind: 'small'; note: string }
  | { kind: 'never' }

const NEVER: EquipmentRule = { kind: 'never' }
const small = (note: string): EquipmentRule => ({ kind: 'small', note })

const SANDBAGS = ['sandbag', 'kleine_zandzakken']
const LIMITED_WEIGHTS = 'maar 2 dumbbells, 1 sandbag en 2 kleine zandzakken voor de hele groep: gebruik ze in een station'

export const EQUIPMENT_RULES: Record<string, EquipmentRule> = {
  Dumbbells: { kind: 'have', anyOf: ['dumbbells'], limited: LIMITED_WEIGHTS },
  Mats: { kind: 'have', anyOf: ['matjes'] },
  Cones: { kind: 'have', anyOf: ['cones'] },
  'Interval Timer': small('gebruik de timer in de app'),
  Kettlebells: { kind: 'have', anyOf: ['kleine_zandzakken'], note: 'kettlebell → kleine zandzak', limited: LIMITED_WEIGHTS },
  'Medicine Balls': { kind: 'have', anyOf: SANDBAGS, note: 'medicine ball → (kleine) zandzak', limited: LIMITED_WEIGHTS },
  'Bench/Step': { kind: 'have', anyOf: ['boxsteps', 'trappen'], note: 'step → bankje of traptrede' },
  'Boxing Gear': small('schaduwboksen, zonder handschoenen of pads'),
  'Kickboxing Gear': small('schaduwboksen, zonder handschoenen of pads'),
  'Exercise Bands': { kind: 'have', anyOf: ['resistance_bands', 'mini_bands'] },
  'Resistance Bands': { kind: 'have', anyOf: ['resistance_bands', 'mini_bands'] },
  'Battling Ropes': { kind: 'have', anyOf: ['battle_rope'], limited: '1 battle rope voor de hele groep: gebruik hem in een station' },
  'Dead Balls': { kind: 'have', anyOf: SANDBAGS, note: 'dead ball → (kleine) zandzak', limited: LIMITED_WEIGHTS },
  'White Board': small('zet het schema op papier of een telefoon'),
  Dice: { kind: 'have', anyOf: ['dobbelstenen'] },
  'Sand Bags': { kind: 'have', anyOf: SANDBAGS, limited: LIMITED_WEIGHTS },
  'Jump Rope': { kind: 'have', anyOf: ['springtouwen'] },
  'Skipping Ropes': { kind: 'have', anyOf: ['springtouwen'] },
  'Pylo Box': { kind: 'have', anyOf: ['boxsteps'], note: 'plyobox → stevig bankje' },
  Chair: { kind: 'have', anyOf: ['boxsteps'], note: 'stoel → bankje' },
  'Agility Ladder': { kind: 'have', anyOf: ['cones'], note: 'agility ladder → cones op een rij' },
  'Weight Plate': { kind: 'have', anyOf: [...SANDBAGS, 'dumbbells'], note: 'halterschijf → zandzak of dumbbell', limited: LIMITED_WEIGHTS },
  Hurdles: { kind: 'have', anyOf: ['hurdles', 'cones'], note: 'hordes → hordes of cones' },
  'Agility Hurdle': { kind: 'have', anyOf: ['hurdles', 'cones'], note: 'hordes → hordes of cones' },
  'Deck of Cards': small('neem een kaartspel mee'),
  'Playing Cards': small('neem een kaartspel mee'),
  'Exercise Cards': small('schrijf de oefeningen op kaartjes of gebruik een kaartspel'),
  'Towels/Sliders': small('handdoek als slider'),
  Sliders: small('handdoek als slider'),
  'Speakers/Music': small('muziek via een telefoon of speakertje'),
  'Tennis Balls': small('neem een paar tennisballen mee'),
  'Soft Balls': small('neem een paar zachte ballen mee'),
  'Playground Balls': small('neem een bal mee'),
  'Coloured Balls': small('neem een paar gekleurde ballen of pionnen mee'),
  Beanbags: small('gebruik sokken of kleine zakjes als beanbag'),
  Balloon: small('neem ballonnen mee'),
  Bandanas: small('neem een paar lintjes of hesjes mee'),
  Chalk: small('neem stoepkrijt mee'),
  'Clothes Pegs': small('neem wasknijpers mee'),
  Coins: small('neem een munt mee'),
  Paper: small('neem papier en pen mee'),
  Pillow: small('gebruik een matje of kussen'),
  Whistle: small('neem een fluitje mee'),
  Phone: small('gebruik een telefoon'),
  Headlamp: small('alleen nodig in het donker'),
  Buckets: small('neem een paar emmers of bakken mee'),
  'Foam Pool Noodles': small('neem een paar zwemnoodles mee'),
  // Niet aanwezig
  Barbells: NEVER, Tyres: NEVER, 'Truck/Tractor Tyre': NEVER, 'Suspension Trainer/Olympic Rings': NEVER,
  Equalizers: NEVER, 'Stability Ball': NEVER, 'BOSU Ball': NEVER, 'Torsion Bar': NEVER,
  'Cardio Equipment': NEVER, Rower: NEVER, Treadmill: NEVER, Sled: NEVER, Sledgehammer: NEVER,
  'Heavy Bag': NEVER, 'Boxing Bag': NEVER, 'Cargo Rope': NEVER, 'Ab Wheel': NEVER, 'Body Bar': NEVER,
  Tripod: NEVER, Car: NEVER, 'Foam Rollers': NEVER, 'Ankle Weights': NEVER, Basketball: NEVER,
  'Soccer Balls': NEVER, 'Target Board': NEVER,
}

export interface EquipmentFit {
  ok: boolean
  missing: string[]        // BootCraft-materiaal dat niet aanwezig of te vervangen is
  notes: string[]          // vervangingen en aanwijzingen in het Nederlands
  limited: string[]        // waarschuwingen over beperkt aantal (stations)
}

export function checkEquipmentFit(equipment: string[], selected: string[]): EquipmentFit {
  const have = new Set(['bodyweight', ...selected])
  const fit: EquipmentFit = { ok: true, missing: [], notes: [], limited: [] }
  for (const item of equipment) {
    const rule = EQUIPMENT_RULES[item] ?? NEVER
    if (rule.kind === 'never' || (rule.kind === 'have' && !rule.anyOf.some((id) => have.has(id)))) {
      fit.ok = false
      fit.missing.push(item)
      continue
    }
    if (rule.note) fit.notes.push(rule.note)
    if (rule.kind === 'have' && rule.limited) fit.limited.push(rule.limited)
  }
  fit.notes = Array.from(new Set(fit.notes))
  fit.limited = Array.from(new Set(fit.limited))
  return fit
}

// ── Kandidaten kiezen voor het genereren ────────────────────────────────────

export interface LibraryMeta {
  id: string
  title: string
  duration_label: string | null
  duration_min: number | null
  duration_max: number | null
  types: string[]
  features: string[]
  equipment: string[]
  tags: string[]
  has_burpees: boolean
  categories: string[]
}

export type LibraryRole = 'warming-up' | 'hoofddeel' | 'afsluiter'

const MAIN_TYPES = ['Conditioning', 'Strength', 'HIT', 'Cardio', 'Game']

// Welke lengte een hoofddeel mag hebben per trainingsduur (in minuten)
const MAIN_RANGE: Record<Duration, [number, number]> = { 30: [15, 25], 45: [20, 35], 60: [30, 45] }

function overlaps(w: LibraryMeta, lo: number, hi: number) {
  return (w.duration_min ?? 0) <= hi && (w.duration_max ?? 999) >= lo
}

export function roleOf(w: LibraryMeta, duration: Duration): LibraryRole | null {
  const short = (w.duration_max ?? 999) <= 15
  if (w.types.includes('Warm Up') && short) return 'warming-up'
  if ((w.types.includes('Finisher') || w.types.includes('Game')) && short) return 'afsluiter'
  const [lo, hi] = MAIN_RANGE[duration]
  if (w.types.some((t) => MAIN_TYPES.includes(t)) && !w.types.includes('Warm Up') && overlaps(w, lo, hi)) return 'hoofddeel'
  return null
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Soorten oefeningen die helemaal uit de bibliotheek zijn gehaald (wens van de instructeur).
// Uitbreiden met een id uit lib/library-categories.ts.
export const EXCLUDED_CATEGORIES: string[] = ['boksen', 'partner-contact', 'muziek']

export function isExcluded(w: Pick<LibraryMeta, 'categories'>): boolean {
  return (w.categories ?? []).some((c) => EXCLUDED_CATEGORIES.includes(c))
}

export function isUsable(w: LibraryMeta, selected: string[]): boolean {
  if (isExcluded(w)) return false
  if (w.types.includes('Fitness Test') || w.tags.includes('virtual')) return false
  return checkEquipmentFit(w.equipment, selected).ok
}

// Kies een warming-up, twee hoofddelen (Claude kiest of combineert) en een afsluiter.
// Trainingen zonder burpees krijgen voorrang, zodat er minder vervangen hoeft te worden.
export function pickLibraryCandidates(
  all: LibraryMeta[],
  opts: { duration: Duration; selected: string[]; requiredIds?: string[] }
): { meta: LibraryMeta; role: LibraryRole; required: boolean }[] {
  const required = (opts.requiredIds ?? [])
    .map((id) => all.find((w) => w.id === id))
    .filter((w): w is LibraryMeta => !!w)
    .map((meta) => ({ meta, role: roleOf(meta, opts.duration) ?? ('hoofddeel' as LibraryRole), required: true }))

  const want: Record<LibraryRole, number> = { 'warming-up': 1, hoofddeel: 2, afsluiter: 1 }
  for (const r of required) want[r.role] = 0

  const usable = shuffle(all.filter((w) => isUsable(w, opts.selected) && !required.some((r) => r.meta.id === w.id)))
  usable.sort((a, b) => Number(a.has_burpees) - Number(b.has_burpees))

  const picked = [...required]
  for (const w of usable) {
    const role = roleOf(w, opts.duration)
    if (!role || want[role] <= 0) continue
    picked.push({ meta: w, role, required: false })
    want[role]--
    if (want['warming-up'] + want.hoofddeel + want.afsluiter === 0) break
  }
  return picked
}
