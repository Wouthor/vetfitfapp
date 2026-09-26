// Indeling van bibliotheektrainingen naar soort oefening.
// Wordt bij het importeren berekend uit de tekst en de kenmerken van elke training
// en opgeslagen in library_workouts.categories.

export interface CategoryInput {
  title: string
  markdown: string
  types: string[]
  features: string[]
  equipment: string[]
  tags: string[]
}

export interface LibraryCategory {
  id: string
  label: string
  description: string
  test: (t: CategoryInput, text: string) => boolean
}

const has = (re: RegExp) => (_t: CategoryInput, text: string) => re.test(text)
const tag = (t: CategoryInput, re: RegExp) => t.tags.some((x) => re.test(x))

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    id: 'boksen',
    label: 'Boksen',
    description: 'Bokstrainingen: schaduwboksen, jab, hook en uppercut, bokshandschoenen of pads',
    // Een enkele "squat met punches" telt niet; een training vol stoten of met echte boksonderdelen wel
    test: (t, text) =>
      t.features.includes('Boxing') ||
      t.equipment.some((e) => /boxing|kickboxing|heavy bag/i.test(e)) ||
      tag(t, /box|kickbox/i) ||
      /\b(jabs?|uppercuts?|shadow ?box\w*|boxing|kickbox\w*|speed bag)\b/.test(text) ||
      (text.match(/\bpunch(es|ing)?\b/g) ?? []).length >= 3,
  },
  {
    id: 'hardlopen',
    label: 'Hardlopen en sprinten',
    description: 'Rennen, sprints, shuttle runs, joggen tussen stations',
    test: (t, text) => t.features.includes('Running') || /\b(run|runs|running|sprint\w*|jog\w*|shuttles?)\b/.test(text),
  },
  {
    id: 'springen',
    label: 'Springen',
    description: 'Jump squats, tuck jumps, box jumps, skaters, hoppen; belast knieën en enkels',
    test: has(/\b(jump squats?|tuck jumps?|box jumps?|broad jumps?|star jumps?|split jumps?|lunge jumps?|jumping lunges?|squat jumps?|skaters?|hops?|hopping|plyo\w*|frog jumps?|lateral jumps?)\b/),
  },
  {
    id: 'jumping-jacks',
    label: 'Jumping jacks en varianten',
    description: 'Jumping jacks, seal jacks, plank jacks en dergelijke',
    test: has(/\b(jumping jacks?|jump jacks?|star jacks?|seal jacks?|plank jacks?|power jacks?|press jacks?|low jacks?|scissor jacks?)\b/),
  },
  {
    id: 'grondwerk',
    label: 'Op en neer van de grond',
    description: 'Burpees, sprawls, up-downs en get-ups: snel liggen en weer opstaan',
    test: has(/\b(burpees?|sprawls?|up[- ]downs?|down[- ]ups?|get[- ]ups?|squat thrusts?)\b/),
  },
  {
    id: 'push-ups',
    label: 'Push-ups',
    description: 'Push-ups en varianten, ook op de knieën',
    test: has(/\b(push[- ]?ups?|press[- ]?ups?)\b/),
  },
  {
    id: 'squats-lunges',
    label: 'Squats en lunges',
    description: 'Squats, lunges, wall sits en andere beenoefeningen',
    test: has(/\b(squats?|lunges?|wall sits?|step[- ]?ups?)\b/),
  },
  {
    id: 'core',
    label: 'Core en buik',
    description: 'Planks, crunches, sit-ups, V-ups, flutter kicks, Russian twists',
    test: has(/\b(planks?|crunch\w*|sit[- ]?ups?|v[- ]?ups?|flutter kicks?|russian twists?|hollow (holds?|rocks?)|leg raises?|dead bugs?|bicycles?|toe touch\w*)\b/),
  },
  {
    id: 'kruipen',
    label: 'Kruipen en vierpotig',
    description: 'Bear crawls, crab walks, inchworms, mountain climbers',
    test: has(/\b(bear crawls?|crab walks?|crab crawls?|inchworms?|walk ?outs?|mountain climbers?|crawl\w*)\b/),
  },
  {
    id: 'gewichten',
    label: 'Met gewichten',
    description: 'Dumbbells, kettlebells, sandbags, medicine balls',
    test: (t, text) =>
      t.equipment.some((e) => /dumbbell|kettlebell|sand bag|medicine ball|weight plate|dead ball/i.test(e)) ||
      /\b(dumbbells?|kettlebells?|sand ?bags?|medicine balls?|med balls?|slam balls?)\b/.test(text),
  },
  {
    id: 'battle-rope',
    label: 'Battle rope',
    description: 'Oefeningen met de battle rope',
    test: (t, text) => t.equipment.includes('Battling Ropes') || /\bbattl\w* ropes?\b/.test(text),
  },
  {
    id: 'springtouw',
    label: 'Springtouw',
    description: 'Touwtjespringen, double unders',
    test: (t, text) => t.equipment.some((e) => /jump rope|skipping/i.test(e)) || /\b(jump ?ropes?|skipping|skip ropes?|double unders?)\b/.test(text),
  },
  {
    id: 'partner-contact',
    label: 'Partner met lichamelijk contact',
    description: 'Kruiwagen, elkaar dragen, bokspringen, medicine ball naar elkaar gooien',
    test: has(/\b(wheelbarrows?|piggy ?backs?|fireman'?s carry|partner carr\w*|leap ?frogs?|carry your partner|partner toss\w*|med ?ball toss\w*)\b/),
  },
  {
    id: 'spel',
    label: 'Spelvormen',
    description: 'Spellen met dobbelstenen, kaarten, tikkertje, teamwedstrijden',
    test: (t, text) =>
      t.types.includes('Game') || t.features.includes('Gamified') || tag(t, /game|dice|card|tag\b/i) ||
      /\b(dice|deck of cards|playing cards|tag game)\b/.test(text),
  },
  {
    id: 'muziek',
    label: 'Op muziek',
    description: 'Trainingen op een liedje of met muziekopdrachten',
    test: (t) => t.features.includes('Song') || tag(t, /song|musical/i),
  },
  {
    id: 'feestdagen',
    label: 'Feestdagenthema',
    description: 'Kerst, Halloween, Pasen, oud en nieuw en andere thema\'s',
    test: (t, text) =>
      tag(t, /holiday|christmas|halloween|easter|new year|valentine|thanksgiving|patrick|july|independence/i) ||
      /\b(christmas|halloween|easter|thanksgiving|valentine)\b/.test(text),
  },
]

export function categorize(t: CategoryInput): string[] {
  const text = `${t.title}\n${t.markdown}`.toLowerCase()
  return LIBRARY_CATEGORIES.filter((c) => c.test(t, text)).map((c) => c.id)
}

export function categoryLabel(id: string): string {
  return LIBRARY_CATEGORIES.find((c) => c.id === id)?.label ?? id
}
