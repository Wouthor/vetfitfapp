import type { WorkoutContent, WorkoutSection, Exercise } from '@/lib/types'

interface WorkoutDisplayProps {
  workout: WorkoutContent
  showKneeAlternatives: boolean
}

const sectionConfig = {
  warming_up: {
    label: 'Warming-up',
    bg: 'bg-yellow-950/40',
    border: 'border-yellow-800/50',
    tag: 'bg-yellow-900 text-yellow-300',
    dot: 'bg-yellow-400',
    emoji: '🔥',
  },
  hoofddeel: {
    label: 'Hoofddeel',
    bg: 'bg-orange-950/40',
    border: 'border-orange-800/50',
    tag: 'bg-orange-900 text-orange-300',
    dot: 'bg-orange-400',
    emoji: '💪',
  },
  cooling_down: {
    label: 'Cooling-down',
    bg: 'bg-blue-950/40',
    border: 'border-blue-800/50',
    tag: 'bg-blue-900 text-blue-300',
    dot: 'bg-blue-400',
    emoji: '❄️',
  },
}

function formatDescription(text: string): string[] {
  if (!text) return []
  // Splits op ". ", "\n", of "- " voor bullet points
  const lines = text
    .split(/\.\s+|\n+/)
    .map((l) => l.replace(/^[-•]\s*/, '').trim())
    .filter((l) => l.length > 2)
  return lines
}

function ExerciseCard({ exercise, index, showKnee }: { exercise: Exercise; index: number; showKnee: boolean }) {
  const bullets = formatDescription(exercise.beschrijving)

  return (
    <div className="bg-gray-900/80 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
        <span className="w-6 h-6 rounded-full bg-gray-700 text-gray-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <h4 className="font-bold text-white flex-1 leading-tight">{exercise.naam}</h4>
        <span className="text-xs font-bold text-orange-400 bg-orange-950 px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
          {exercise.duur_of_sets}
        </span>
      </div>

      {/* Beschrijving als bullets */}
      <div className="px-4 py-3 space-y-2">
        {bullets.length > 1 ? (
          <ul className="space-y-1">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-300 leading-relaxed">{exercise.beschrijving}</p>
        )}

        {/* Knie-alternatief */}
        {showKnee && exercise.knie_vriendelijk_alternatief && (
          <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-800">
            <span className="text-sm flex-shrink-0">🦵</span>
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Knie-alternatief </span>
              <span className="text-xs text-blue-300">{exercise.knie_vriendelijk_alternatief}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({
  sectionKey,
  section,
  showKnee,
}: {
  sectionKey: keyof typeof sectionConfig
  section: WorkoutSection
  showKnee: boolean
}) {
  const config = sectionConfig[sectionKey]

  return (
    <div className={`rounded-2xl border ${config.bg} ${config.border} overflow-hidden`}>
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.emoji}</span>
          <h3 className="font-bold text-lg text-white">{config.label}</h3>
          <span className="text-xs text-gray-500">
            {section.oefeningen.length} oefeningen
          </span>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${config.tag}`}>
          {section.duur}
        </span>
      </div>

      {/* Oefeningen */}
      <div className="p-3 space-y-2">
        {section.oefeningen.map((exercise, i) => (
          <ExerciseCard key={i} exercise={exercise} index={i} showKnee={showKnee} />
        ))}
      </div>
    </div>
  )
}

export default function WorkoutDisplay({ workout, showKneeAlternatives }: WorkoutDisplayProps) {
  const total = [
    ...(workout.warming_up?.oefeningen ?? []),
    ...(workout.hoofddeel?.oefeningen ?? []),
    ...(workout.cooling_down?.oefeningen ?? []),
  ].length

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{total} oefeningen in totaal</p>
      <Section sectionKey="warming_up" section={workout.warming_up} showKnee={showKneeAlternatives} />
      <Section sectionKey="hoofddeel" section={workout.hoofddeel} showKnee={showKneeAlternatives} />
      <Section sectionKey="cooling_down" section={workout.cooling_down} showKnee={showKneeAlternatives} />
    </div>
  )
}
