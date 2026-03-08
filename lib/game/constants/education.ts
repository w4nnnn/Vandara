export interface CourseDef {
  id: string
  label: string
  description: string
  durationMinutes: number
  cost: number
  levelRequired: number
  rewards: {
    statBonus?: Partial<Record<'strength' | 'defense' | 'speed' | 'dexterity', number>>
    maxEnergyBonus?: number
    maxNerveBonus?: number
    maxHealthBonus?: number
    maxHappyBonus?: number
  }
}

export const COURSES: CourseDef[] = [
  {
    id: 'first_aid', label: 'Pertolongan Pertama', description: 'Pelajari dasar-dasar pertolongan pertama.',
    durationMinutes: 30, cost: 2000, levelRequired: 2,
    rewards: { maxHealthBonus: 10 },
  },
  {
    id: 'fitness_101', label: 'Kebugaran Dasar', description: 'Kursus dasar kebugaran tubuh.',
    durationMinutes: 60, cost: 5000, levelRequired: 3,
    rewards: { maxEnergyBonus: 10, statBonus: { strength: 2 } },
  },
  {
    id: 'martial_arts', label: 'Bela Diri', description: 'Teknik bela diri dasar sampai menengah.',
    durationMinutes: 120, cost: 15000, levelRequired: 5,
    rewards: { statBonus: { strength: 3, defense: 3 } },
  },
  {
    id: 'parkour_course', label: 'Kursus Parkour', description: 'Latih kelincahan dan kecepatan alami.',
    durationMinutes: 90, cost: 10000, levelRequired: 4,
    rewards: { statBonus: { speed: 3, dexterity: 2 } },
  },
  {
    id: 'meditation', label: 'Meditasi', description: 'Tingkatkan ketenangan dan fokus mental.',
    durationMinutes: 45, cost: 3000, levelRequired: 2,
    rewards: { maxHappyBonus: 15, maxNerveBonus: 5 },
  },
  {
    id: 'advanced_combat', label: 'Tempur Lanjutan', description: 'Teknik tempur tingkat lanjut.',
    durationMinutes: 180, cost: 30000, levelRequired: 10,
    rewards: { statBonus: { strength: 5, defense: 5, speed: 3, dexterity: 3 } },
  },
  {
    id: 'survival_training', label: 'Latihan Bertahan Hidup', description: 'Teknik bertahan dalam kondisi ekstrim.',
    durationMinutes: 150, cost: 25000, levelRequired: 8,
    rewards: { maxHealthBonus: 25, maxEnergyBonus: 15 },
  },
]
