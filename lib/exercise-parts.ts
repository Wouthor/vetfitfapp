import type { Exercise } from './types'

// Een oefening-item kan een blok zijn met meerdere oefeningen (bijv. per ronde).
// Deze helpers maken daar een overzichtelijke lijst van: groepen met losse oefeningen en aantallen.

export interface PartItem {
  aantal: string | null
  naam: string
  detail?: string | null   // toelichting die tussen haakjes stond
}

export interface PartGroup {
  label: string | null     // bijv. "Ronde 1"
  opzet: string | null     // bijv. "10 sets van"
  items: PartItem[]
  note?: boolean           // opmerking zoals "Totaal: 2 rondes", geen oefeningen
}

const QTY = /^((?:~?\d+(?:[.,]\d+)?\s*(?:x|×|reps?|herhalingen|keer|sec(?:onden)?|s|min(?:uten)?|m|meter|km|stappen)?)|(?:max(?:imaal)?))\s+(.+)$/i
const GROUP_WORDS = '(?:ronde|blok|station|minuut|set|deel|circuit|totaal|let op|tip)'
const GROUP = new RegExp(`^(${GROUP_WORDS}\\s*[\\w&-]*(?:\\s*(?:en|&)\\s*\\d+)?(?:\\s*\\([^)]*\\))?)\\s*:\\s*(.+)$`, 'i')
const NOTE_LABEL = /^(totaal|let op|tip)/i
const OPZET = /^(\d+\s*(?:sets?|rondes?|ronden|x|×|keer)(?:\s+van)?)\s+(.+)$/i

// Splits op " + ", maar niet binnen haakjes: "4 ronden × (20s jog + 20s sprint)" blijft één geheel
function splitPlus(text: string): string[] {
  const out: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '(') depth++
    else if (c === ')') depth = Math.max(0, depth - 1)
    else if (depth === 0 && c === '+' && text[i - 1] === ' ' && text[i + 1] === ' ') {
      out.push(text.slice(start, i - 1))
      start = i + 2
    }
  }
  out.push(text.slice(start))
  return out.map((x) => x.trim()).filter(Boolean)
}

// "Zijplank (20 seconden links, 20 seconden rechts)" → naam "Zijplank", detail "20 seconden links, ..."
function splitDetail(naam: string): { naam: string; detail: string | null } {
  // Alleen als er precies één stuk tussen haakjes aan het eind staat
  const m = naam.match(/^([^()]+?)\s*\(([^()]+)\)\s*$/)
  return m ? { naam: m[1].trim(), detail: m[2].trim() } : { naam, detail: null }
}

function splitItem(text: string): PartItem {
  const t = text.trim().replace(/[.;]$/, '')
  const m = t.match(QTY)
  const base = m ? { aantal: m[1].trim(), rest: m[2].trim() } : { aantal: null, rest: t }
  return { aantal: base.aantal, ...splitDetail(base.rest) }
}

// Genummerde opsomming: "1. Stir the pot (...). 2. Bent-knee V-sit (...). 3. Zijplank (...)"
function parseNumbered(t: string): PartGroup[] | null {
  // Geen matchAll: die bestaat niet op iOS 12 (oude iPad)
  const marks: RegExpExecArray[] = []
  const re = /(?:^|\s)(\d{1,2})\.\s+(?=[A-Za-zÀ-ÿ])/g
  let found: RegExpExecArray | null
  while ((found = re.exec(t)) !== null) marks.push(found)
  if (marks.length < 2 || marks[0][1] !== '1') return null
  const opzet = t.slice(0, marks[0].index ?? 0).trim().replace(/[:.]$/, '') || null
  const items = marks.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length
    const end = i + 1 < marks.length ? (marks[i + 1].index ?? t.length) : t.length
    return { aantal: `${i + 1}.`, ...splitDetail(t.slice(start, end).trim().replace(/[.;]$/, '')) }
  })
  return [{ label: null, opzet, items }]
}

// Ontleedt een lange "duur_of_sets"-tekst zoals
// "Ronde 1: 10 sets van 5 push ups + 5 squats. Ronde 2: 8 sets van 5 sea turtles + 10m walking lunge"
// Geeft null als het gewoon een korte aanduiding is (bijv. "3x10" of "40s werk / 20s rust").
export function parseSetsText(text: string | null | undefined): PartGroup[] | null {
  if (!text) return null
  const t = text.trim()
  const numbered = parseNumbered(t)
  if (numbered) return numbered
  const hasStructure = splitPlus(t).length > 1 || /\b(ronde|blok|station)\s*\d+\s*(\([^)]*\))?\s*:/i.test(t)
  if (!hasStructure || t.length < 30) return null

  const segments = t
    .split(new RegExp(`(?:\\.\\s+|;\\s+)(?=${GROUP_WORDS}\\s*[\\w&-]*(?:\\s*\\([^)]*\\))?\\s*:)`, 'i'))
    .map((s) => s.trim())
    .filter(Boolean)

  const groups: PartGroup[] = segments.map((seg) => {
    let label: string | null = null
    let rest = seg
    const g = seg.match(GROUP)
    if (g) { label = g[1].trim(); rest = g[2].trim() }
    // "Totaal: 2 rondes door het circuit ..." is een opmerking, geen lijst met oefeningen
    if (label && NOTE_LABEL.test(label)) return { label, opzet: null, note: true, items: [{ aantal: null, naam: rest.replace(/[.;]$/, ''), detail: null }] }
    let opzet: string | null = null
    // "3 rondes: 10 squats + 10 push-ups"
    const pc = rest.match(/^(\d+\s*(?:rondes?|ronden|sets?|x|×|keer)[^:]{0,20}):\s*(.+)$/i)
    if (pc) { opzet = pc[1].trim(); rest = pc[2].trim() }
    const o = rest.match(OPZET)
    if (!opzet && o && splitPlus(rest).length > 1) { opzet = o[1].trim().replace(/\s+van$/i, ''); rest = o[2].trim() }
    // " / " scheidt afwisselende taken (bijv. partner A sprint / partner B push-ups)
    const pieces = splitPlus(rest).flatMap((x) => (label ? x.split(/\s+\/\s+/) : [x]))
    const items = pieces.map(splitItem).filter((i) => i.naam)
    return { label, opzet, items }
  })

  // Alleen de moeite waard als er echt meerdere oefeningen of groepen uitkomen
  const itemCount = groups.reduce((n, g) => n + g.items.length, 0)
  return itemCount >= 2 ? groups : null
}

// Onderdelen die Claude apart heeft aangeleverd, gegroepeerd in de volgorde waarin ze staan
export function groupParts(ex: Exercise): PartGroup[] | null {
  const parts = ex.onderdelen?.filter((p) => p && p.naam)
  if (!parts?.length) return null
  // Kopjes als "Oefening 1", "Oefening 2" voegen niets toe: dan één lijst zonder kopjes
  const uselessLabels = parts.every((p) => !p.groep || /^(oefening|exercise|opdracht)\s*\d+$/i.test(p.groep.trim()))
  const groups: PartGroup[] = []
  for (const p of parts) {
    const label = uselessLabels ? null : p.groep?.trim() || null
    let g = groups[groups.length - 1]
    if (!g || g.label !== label) { g = { label, opzet: null, items: [] }; groups.push(g) }
    // "Resistance band rows – staand, band onder voeten" → naam + uitleg eronder
    let naam = p.naam.trim()
    let detail: string | null = null
    const dash = naam.match(/^(.{3,40}?)\s+[–—-]\s+(.+)$/)
    if (dash) { naam = dash[1].trim(); detail = dash[2].trim() }
    else { const d = splitDetail(naam); naam = d.naam; detail = d.detail }
    g.items.push({ aantal: p.aantal?.trim() || null, naam, detail })
  }
  return groups
}

export function exerciseParts(ex: Exercise): PartGroup[] | null {
  return groupParts(ex) ?? parseSetsText(ex.duur_of_sets)
}
