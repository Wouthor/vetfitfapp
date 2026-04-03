export interface EquipmentItem {
  id: string
  label: string
  emoji: string
}

export const EQUIPMENT_LIST: EquipmentItem[] = [
  { id: 'bodyweight', label: 'Bodyweight', emoji: '🧍' },
  { id: 'matjes', label: 'Matjes (eigen)', emoji: '🟩' },
  { id: 'springtouwen', label: 'Springtouwen', emoji: '🪢' },
  { id: 'dumbbells', label: '2 Dumbbells', emoji: '💪' },
  { id: 'sandbag', label: 'Sandbag', emoji: '🎒' },
  { id: 'resistance_bands', label: 'Resistance bands', emoji: '🔴' },
  { id: 'mini_bands', label: 'Mini-bands', emoji: '🔵' },
  { id: 'dobbelstenen', label: 'Dobbelstenen', emoji: '🎲' },
  { id: 'cones', label: 'Cones', emoji: '🔶' },
  { id: 'battle_rope', label: 'Battle rope (1x)', emoji: '🌊' },
  { id: 'hurdles', label: '2 Hurdles', emoji: '🚧' },
  { id: 'ronde_park', label: 'Ronde park (1 km)', emoji: '🏃' },
  { id: 'boxsteps', label: 'Boxsteps / bankjes', emoji: '📦' },
  { id: 'trappen', label: 'Trappen (15-20 treden)', emoji: '🪜' },
]
