import Anthropic from '@anthropic-ai/sdk'
import type { Duration, Intensity, WorkoutContent, Exercise } from './types'

// Oefeningen die nooit in een training mogen voorkomen (wens van de instructeur).
// Uitbreiden: voeg een naam en een zoekpatroon toe.
const BANNED_EXERCISES: { name: string; pattern: RegExp }[] = [
  { name: 'burpees (en varianten, zoals half burpees of burpee broad jumps)', pattern: /burpee/i },
]

const BANNED_RULE = `- Gebruik NOOIT deze oefeningen, ook niet als een voorbeeldtraining, webbron of speciale wens ze noemt: ${BANNED_EXERCISES.map((b) => b.name).join('; ')}. Kies in dat geval een andere oefening.`

function isBanned(ex: Exercise): boolean {
  const text = `${ex.naam} ${ex.beschrijving} ${ex.duur_of_sets}`
  return BANNED_EXERCISES.some((b) => b.pattern.test(text))
}

export interface LibraryPromptItem {
  id: string
  title: string
  role: string
  required: boolean
  durationLabel: string | null
  markdown: string
  notes: string[]
  limited: string[]
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is niet ingesteld in .env.local')
  return new Anthropic({ apiKey })
}

export async function generateWorkout(params: {
  duration: Duration
  intensity: Intensity
  kneeFriendly: boolean
  exampleWorkouts: string[]
  equipment?: string[]
  chatfit?: string
  useWebSearch?: boolean
  library?: LibraryPromptItem[]
}): Promise<{ content: WorkoutContent; title: string; sourceLibraryIds: string[] }> {
  const { duration, intensity, kneeFriendly, exampleWorkouts, equipment = [], chatfit = '', useWebSearch = false, library = [] } = params

  const warmupMinutes = duration === 30 ? '5' : '10'
  const mainMinutes = duration === 30 ? '15-20' : duration === 45 ? '25-30' : '35-40'
  const cooldownMinutes = duration === 30 ? '5' : '5-10'

  const examples = exampleWorkouts
    .slice(0, 8)
    .map((w, i) => `--- Training ${i + 1} ---\n${w}`)
    .join('\n\n')

  const libraryBlock = library
    .map((l) => [
      `--- [id: ${l.id}] ${l.required ? 'VERPLICHT · ' : ''}rol: ${l.role} · "${l.title}" · ${l.durationLabel ?? 'duur onbekend'} ---`,
      l.notes.length ? `Materiaalvervanging: ${l.notes.join('; ')}` : '',
      l.limited.length ? `Beperkt materiaal: ${l.limited.join('; ')}` : '',
      l.markdown.length > 3500 ? l.markdown.slice(0, 3500) + '\n[...ingekort]' : l.markdown,
    ].filter(Boolean).join('\n'))
    .join('\n\n')

  const prompt = `Je bent een ervaren bootcamp instructeur. Genereer een nieuwe bootcamp training${library.length ? ', vooral opgebouwd uit de bibliotheektrainingen hieronder' : ''}${useWebSearch ? ', aangevuld met actuele bootcamp/HIIT-oefeningen die je online opzoekt' : ''}.
${library.length ? `
BIBLIOTHEEKTRAININGEN (Engelstalig, uit de BootCraft-bibliotheek; dit is je belangrijkste bron):
${libraryBlock}
` : ''}
EIGEN VOORBEELDTRAININGEN VAN DE INSTRUCTEUR (inspiratie voor stijl en oefeningen):
${examples}

PARAMETERS VOOR DE NIEUWE TRAINING:
- Totale duur: ${duration} minuten
- Intensiteit: ${intensity}
- Knieblessures aanwezig in de groep: ${kneeFriendly ? 'JA - pas oefeningen aan' : 'nee'}
- Beschikbaar materiaal: ${equipment.length > 0 ? equipment.join(', ') : 'geen specifiek materiaal (alleen lichaamsgewicht)'}${chatfit ? `\n- Speciale wens (ChatFit): ${chatfit}` : ''}

TIJDSVERDELING:
- Warming-up: ~${warmupMinutes} minuten
- Hoofddeel: ~${mainMinutes} minuten
- Cooling-down: ~${cooldownMinutes} minuten

INSTRUCTIES:
${library.length ? `- Bouw de training vooral op uit de bibliotheektrainingen: de warming-up als warming-up, het beste hoofddeel (kies er één of combineer) als hoofddeel, en de afsluiter als laatste blok van het hoofddeel. Trainingen met VERPLICHT moeten er herkenbaar in zitten
- Neem de opzet over (rondes, tijden, AMRAP/EMOM/tabata, spelregels, partner- of teamvorm), vertaal alles naar het Nederlands en pas de lengte aan zodat het in de tijdsverdeling past
- Volg de materiaalvervangingen. Bij beperkt materiaal: laat dat materiaal op één station gebruiken en laat de rest van de groep tegelijk iets anders doen
- De groep bestaat uit 5 tot 10 personen; geef bij partner- of teamvormen aan wat je doet bij een oneven aantal
- Zet in "gebruikte_bronnen" de id's van de bibliotheektrainingen die je echt hebt gebruikt
` : ''}${useWebSearch ? `- Zoek online naar 2-3 frisse bootcamp- of HIIT-oefeningen ter inspiratie (bijv. via fitness-blogs of trainingsprogramma's) en verwerk wat daar bruikbaar is\n- Ook bij oefeningen uit een webbron geldt: gebruik ALLEEN het hierboven genoemde beschikbare materiaal, nooit materiaal dat je online tegenkomt maar dat niet in de lijst staat\n` : ''}${BANNED_RULE}
- Geef ALTIJD een knie-vriendelijk alternatief per oefening, ook als er geen knieblessures zijn
- Varieer de oefeningen, gebruik de voorbeelden als basis maar wees creatief
- Gebruik ALLEEN het beschikbare materiaal in de oefeningen — geen materiaal dat niet in de lijst staat
${chatfit ? '- Houd GOED rekening met de speciale wens van de ChatFit instructie — dit heeft prioriteit' : ''}
- Pas de intensiteit aan: laag = meer rust, middel = standaard, hoog = minder rust en meer sets
- Schrijf in het Nederlands
- Houd beschrijvingen kort en puntsgewijs: gebruik 2-4 korte zinnen gescheiden door ". " (geen lange lappen tekst)
- Geef als LAATSTE bericht ALLEEN geldig JSON terug, geen extra tekst ervoor of erna

VEREISTE JSON-STRUCTUUR:
{
  "titel": "Een korte, pakkende Nederlandse naam voor deze specifieke training (bijv. 'De Vulkaan', 'Stalen Benen', 'Ochtendstorm', 'De Ijzeren Ronde'). Geen generieke naam zoals 'Bootcamp Training'.",${library.length ? `
  "gebruikte_bronnen": ["id van elke gebruikte bibliotheektraining"],` : ''}
  "warming_up": {
    "duur": "${warmupMinutes} minuten",
    "oefeningen": [
      {
        "naam": "naam van de oefening",
        "beschrijving": "hoe voer je de oefening uit",
        "duur_of_sets": "bijv. 3x10 of 3 ronden: 40s werk / 20s rust",
        "knie_vriendelijk_alternatief": "alternatieve oefening zonder kniebelasting",
        "timer": {
          "type": "interval",
          "work_seconds": 40,
          "rest_seconds": 20,
          "rounds": 3
        }
      }
    ]
  },
  "hoofddeel": {
    "duur": "${mainMinutes} minuten",
    "oefeningen": [...]
  },
  "cooling_down": {
    "duur": "${cooldownMinutes} minuten",
    "oefeningen": [...]
  }
}

TIMER REGELS (verplicht voor elk oefening):
- Tijdoefening (bijv. 45 seconden planken): gebruik type "simple", work_seconds = aantal seconden, rounds = 1
- Intervaltraining (bijv. 40s werk / 20s rust × 3): gebruik type "interval", work_seconds, rest_seconds en rounds invullen
- Rep-oefening (bijv. 3x10 squats, herhalingen): gebruik timer: null
- Gebruik realistic tijden (20-60s werk, 10-30s rust)
- Cooling-down oefeningen zijn bijna altijd "simple" (statisch rekken, bijv. 30 seconden houden)`

  const libraryIds = new Set(library.map((l) => l.id))

  function parseAndExtract(str: string): { content: WorkoutContent; title: string; sourceLibraryIds: string[] } {
    const parsed = JSON.parse(str)
    const titel: string = typeof parsed.titel === 'string' && parsed.titel.trim()
      ? parsed.titel.trim()
      : 'Bootcamp Training'
    // Alleen id's die we echt hebben aangeboden; verplichte bronnen tellen altijd mee
    const claimed: string[] = Array.isArray(parsed.gebruikte_bronnen) ? parsed.gebruikte_bronnen.filter((id: unknown) => typeof id === 'string' && libraryIds.has(id)) : []
    const sourceLibraryIds = Array.from(new Set([...library.filter((l) => l.required).map((l) => l.id), ...claimed]))
    const { titel: _unused, gebruikte_bronnen: _bronnen, ...content } = parsed
    return { content: content as WorkoutContent, title: titel, sourceLibraryIds }
  }

  // Repareer afgekapte JSON: knip de onvolledige laatste entry weg en sluit alle haakjes af
  function repairTruncated(raw: string): string {
    let str = raw
    const lastComplete = str.lastIndexOf('},')
    if (lastComplete > 0) str = str.slice(0, lastComplete + 1)
    const stack: string[] = []
    let inString = false
    for (let i = 0; i < str.length; i++) {
      const c = str[i]
      if (inString) {
        if (c === '\\') i++
        else if (c === '"') inString = false
      } else if (c === '"') inString = true
      else if (c === '{') stack.push('}')
      else if (c === '[') stack.push(']')
      else if (c === '}' || c === ']') stack.pop()
    }
    return str + stack.reverse().join('')
  }

  let lastError = 'Onbekende fout'
  for (let attempt = 1; attempt <= 2; attempt++) {
    const message = await getClient().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
      ...(useWebSearch ? { tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 } as any] } : {}),
    })

    // Bij websearch bevat de response ook search/tool-blokken; de JSON staat in het laatste tekstblok
    const textBlocks = message.content.filter((b): b is Anthropic.TextBlock => b.type === 'text')
    const text = textBlocks.length > 0 ? textBlocks[textBlocks.length - 1].text : ''
    const start = text.indexOf('{')
    if (start === -1) {
      lastError = 'Claude gaf geen JSON terug'
      console.error(`generateWorkout poging ${attempt}: geen JSON (stop_reason=${message.stop_reason})`)
      continue
    }
    const end = text.lastIndexOf('}')
    const jsonStr = end > start ? text.slice(start, end + 1) : text.slice(start)

    let result: { content: WorkoutContent; title: string; sourceLibraryIds: string[] } | null = null
    try {
      result = parseAndExtract(jsonStr)
    } catch {
      try {
        result = parseAndExtract(repairTruncated(jsonStr))
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        console.error(
          `generateWorkout poging ${attempt}: JSON onleesbaar (stop_reason=${message.stop_reason}, lengte=${text.length}, einde=${JSON.stringify(text.slice(-120))}): ${lastError}`
        )
      }
    }
    if (result) {
      result.content = await removeBannedExercises(result.content, { equipment, kneeFriendly, intensity })
      return result
    }
  }

  throw new Error('Training kon niet worden verwerkt. Probeer opnieuw.')
}

const SECTION_LABELS = { warming_up: 'Warming-up', hoofddeel: 'Hoofddeel', cooling_down: 'Cooling-down' } as const

async function removeBannedExercises(
  content: WorkoutContent,
  opts: { equipment: string[]; kneeFriendly: boolean; intensity: Intensity }
): Promise<WorkoutContent> {
  const out = { ...content }
  for (const key of Object.keys(SECTION_LABELS) as (keyof typeof SECTION_LABELS)[]) {
    const section = out[key]
    if (!section?.oefeningen?.some(isBanned)) continue
    const oefeningen: Exercise[] = []
    for (const ex of section.oefeningen) {
      if (!isBanned(ex)) { oefeningen.push(ex); continue }
      let replacement: Exercise | null = null
      for (let i = 0; i < 2 && !replacement; i++) {
        try {
          const alt = await generateExerciseAlternative({ sectionLabel: SECTION_LABELS[key], currentExercise: ex, ...opts })
          if (!isBanned(alt)) replacement = alt
        } catch {}
      }
      console.warn(`Verboden oefening "${ex.naam}" ${replacement ? `vervangen door "${replacement.naam}"` : 'verwijderd'}`)
      if (replacement) oefeningen.push(replacement)
    }
    out[key] = { ...section, oefeningen }
  }
  return out
}

export async function generateExerciseAlternative(params: {
  sectionLabel: string
  currentExercise: Exercise
  equipment?: string[]
  kneeFriendly: boolean
  intensity: Intensity
}): Promise<Exercise> {
  const { sectionLabel, currentExercise, equipment = [], kneeFriendly, intensity } = params

  const prompt = `Je bent een ervaren bootcamp instructeur. Vervang ÉÉN oefening in een bestaande training door een frisse, andere oefening. De rest van de training blijft ongewijzigd, dus geef alleen deze ene nieuwe oefening terug.

CONTEXT:
- Onderdeel van de training: ${sectionLabel}
- Huidige oefening die vervangen moet worden: "${currentExercise.naam}" — ${currentExercise.beschrijving}
- Intensiteit: ${intensity}
- Knieblessures aanwezig in de groep: ${kneeFriendly ? 'JA - pas de oefening aan' : 'nee'}
- Beschikbaar materiaal: ${equipment.length > 0 ? equipment.join(', ') : 'geen specifiek materiaal (alleen lichaamsgewicht)'}

INSTRUCTIES:
- Bedenk een andere oefening dan de huidige, passend bij hetzelfde onderdeel van de training
${BANNED_RULE}
- Gebruik ALLEEN het beschikbare materiaal — geen materiaal dat niet in de lijst staat
- Geef ALTIJD een knie-vriendelijk alternatief
- Schrijf in het Nederlands, kort en puntsgewijs (2-4 korte zinnen gescheiden door ". ")
- Geef de output ALLEEN als geldig JSON, geen extra tekst, in dit formaat:
{
  "naam": "naam van de oefening",
  "beschrijving": "hoe voer je de oefening uit",
  "duur_of_sets": "bijv. 3x10 of 3 ronden: 40s werk / 20s rust",
  "knie_vriendelijk_alternatief": "alternatieve oefening zonder kniebelasting",
  "timer": { "type": "interval", "work_seconds": 40, "rest_seconds": 20, "rounds": 3 } of null bij een rep-oefening
}`

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) {
    throw new Error('Kon geen alternatieve oefening genereren. Probeer opnieuw.')
  }

  try {
    return JSON.parse(text.slice(start, end + 1)) as Exercise
  } catch {
    throw new Error('Kon geen alternatieve oefening genereren. Probeer opnieuw.')
  }
}

export async function generateKneeFriendlyAlternative(exerciseName: string, description: string): Promise<string> {
  const message = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Geef een knie-vriendelijk alternatief voor deze bootcamp oefening (1 zin):
Oefening: ${exerciseName}
Beschrijving: ${description}

Geef alleen de naam en korte beschrijving van het alternatief, geen extra tekst.`,
    }],
  })

  return message.content[0].type === 'text' ? message.content[0].text.trim() : 'Alternatief niet beschikbaar'
}
