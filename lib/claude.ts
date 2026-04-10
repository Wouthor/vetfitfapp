import Anthropic from '@anthropic-ai/sdk'
import type { Duration, Intensity, WorkoutContent } from './types'

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
}): Promise<WorkoutContent> {
  const { duration, intensity, kneeFriendly, exampleWorkouts, equipment = [], chatfit = '' } = params

  const warmupMinutes = duration === 30 ? '5' : '10'
  const mainMinutes = duration === 30 ? '15-20' : duration === 45 ? '25-30' : '35-40'
  const cooldownMinutes = duration === 30 ? '5' : '5-10'

  const examples = exampleWorkouts
    .slice(0, 8)
    .map((w, i) => `--- Training ${i + 1} ---\n${w}`)
    .join('\n\n')

  const prompt = `Je bent een ervaren bootcamp instructeur. Genereer een nieuwe bootcamp training op basis van de onderstaande voorbeeldtrainingen.

VOORBEELDTRAININGEN (gebruik deze als inspiratie voor oefeningen en structuur):
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
- Geef ALTIJD een knie-vriendelijk alternatief per oefening, ook als er geen knieblessures zijn
- Varieer de oefeningen, gebruik de voorbeelden als basis maar wees creatief
- Gebruik ALLEEN het beschikbare materiaal in de oefeningen — geen materiaal dat niet in de lijst staat
${chatfit ? '- Houd GOED rekening met de speciale wens van de ChatFit instructie — dit heeft prioriteit' : ''}
- Pas de intensiteit aan: laag = meer rust, middel = standaard, hoog = minder rust en meer sets
- Schrijf in het Nederlands
- Houd beschrijvingen kort en puntsgewijs: gebruik 2-4 korte zinnen gescheiden door ". " (geen lange lappen tekst)
- Geef de output ALLEEN als geldig JSON, geen extra tekst

VEREISTE JSON-STRUCTUUR:
{
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

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Haal JSON op uit de response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Claude gaf geen geldige JSON terug')
  }

  let jsonStr = jsonMatch[0]

  // Repareer afgekapte JSON door ontbrekende sluithaakjes toe te voegen
  try {
    return JSON.parse(jsonStr) as WorkoutContent
  } catch {
    // Tel open vs gesloten haakjes en sluit af indien nodig
    const opens = (jsonStr.match(/\[/g) || []).length
    const closes = (jsonStr.match(/\]/g) || []).length
    const openBraces = (jsonStr.match(/\{/g) || []).length
    const closeBraces = (jsonStr.match(/\}/g) || []).length

    // Verwijder incomplete laatste entry en sluit netjes af
    const lastCompleteEntry = jsonStr.lastIndexOf('},')
    if (lastCompleteEntry > 0) {
      jsonStr = jsonStr.slice(0, lastCompleteEntry + 1)
    }

    // Voeg ontbrekende sluithaakjes toe
    for (let i = 0; i < opens - closes; i++) jsonStr += ']'
    for (let i = 0; i < openBraces - closeBraces; i++) jsonStr += '}'

    try {
      return JSON.parse(jsonStr) as WorkoutContent
    } catch {
      throw new Error('Training kon niet worden verwerkt. Probeer opnieuw.')
    }
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
