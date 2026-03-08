export type GymStat = 'strength' | 'defense' | 'speed' | 'dexterity'

export interface GymExercise {
  id: string
  label: string
  stat: GymStat
  energyCost: number
  baseGain: number       // base stat points gained
  description: string
}

export const GYM_EXERCISES: GymExercise[] = [
  { id: 'punch_bag', label: 'Samsak Tinju', stat: 'strength', energyCost: 5, baseGain: 1, description: 'Pukul samsak untuk melatih kekuatan.' },
  { id: 'bench_press', label: 'Bench Press', stat: 'strength', energyCost: 10, baseGain: 3, description: 'Angkat beban berat untuk peningkatan serius.' },
  { id: 'deadlift', label: 'Deadlift', stat: 'strength', energyCost: 15, baseGain: 5, description: 'Raja dari latihan kekuatan.' },
  { id: 'dodge_drill', label: 'Latihan Menghindar', stat: 'defense', energyCost: 5, baseGain: 1, description: 'Berlatih menghindari serangan.' },
  { id: 'sparring', label: 'Sparring', stat: 'defense', energyCost: 10, baseGain: 3, description: 'Sparring dengan partner untuk menguatkan pertahanan.' },
  { id: 'iron_body', label: 'Tubuh Baja', stat: 'defense', energyCost: 15, baseGain: 5, description: 'Latih tubuh untuk menahan damage.' },
  { id: 'sprints', label: 'Sprint', stat: 'speed', energyCost: 5, baseGain: 1, description: 'Ledakan kecepatan dalam waktu singkat.' },
  { id: 'hurdles', label: 'Lari Rintangan', stat: 'speed', energyCost: 10, baseGain: 3, description: 'Latih kelincahan dan kecepatan bersama.' },
  { id: 'wind_sprints', label: 'Sprint Angin', stat: 'speed', energyCost: 15, baseGain: 5, description: 'Dorong kaki sampai batasnya.' },
  { id: 'target_practice', label: 'Latihan Target', stat: 'dexterity', energyCost: 5, baseGain: 1, description: 'Tingkatkan koordinasi mata-tangan.' },
  { id: 'juggling', label: 'Juggling', stat: 'dexterity', energyCost: 10, baseGain: 3, description: 'Refleks tajam melalui gerakan kompleks.' },
  { id: 'obstacle_course', label: 'Parkour', stat: 'dexterity', energyCost: 15, baseGain: 5, description: 'Latihan ketangkasan seluruh tubuh.' },
]
