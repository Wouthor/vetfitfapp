export type Role = 'instructor' | 'athlete'
export type Intensity = 'laag' | 'middel' | 'hoog'
export type Duration = 30 | 45 | 60

export interface Profile {
  id: string
  email: string
  role: Role
  created_at: string
}

export interface ExerciseTimer {
  type: 'simple' | 'interval'
  work_seconds: number
  rest_seconds?: number
  rounds?: number
}

export interface Exercise {
  naam: string
  beschrijving: string
  duur_of_sets: string
  knie_vriendelijk_alternatief: string
  timer?: ExerciseTimer | null
}

export interface WorkoutSection {
  duur: string
  oefeningen: Exercise[]
}

export interface WorkoutContent {
  warming_up: WorkoutSection
  hoofddeel: WorkoutSection
  cooling_down: WorkoutSection
}

export interface GeneratedWorkout {
  id: string
  created_by: string
  duration: Duration
  intensity: Intensity
  knee_friendly: boolean
  content: WorkoutContent
  title: string | null
  published: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface SourceWorkout {
  id: string
  drive_file_id: string
  file_name: string
  raw_text: string | null
  parsed_content: WorkoutContent | null
  synced_at: string
}

export interface GenerateWorkoutParams {
  duration: Duration
  intensity: Intensity
  kneeFriendly: boolean
}
