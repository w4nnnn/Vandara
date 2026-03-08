export type GymStat = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma' | 'luck' | 'perception'

export type GymCategory = 'physical' | 'mental' | 'special'

export interface GymExercise {
  id: string
  label: string
  stat: GymStat
  category: GymCategory
  energyCost: number
  baseGain: number
  description: string
}

export const GYM_EXERCISES: GymExercise[] = [
  // ── Physical (STR, DEX, CON) ──
  { id: 'punch_bag', label: 'Samsak Tinju', stat: 'strength', category: 'physical', energyCost: 5, baseGain: 1, description: 'Pukul samsak untuk melatih kekuatan.' },
  { id: 'bench_press', label: 'Bench Press', stat: 'strength', category: 'physical', energyCost: 10, baseGain: 3, description: 'Angkat beban berat untuk peningkatan serius.' },
  { id: 'deadlift', label: 'Deadlift', stat: 'strength', category: 'physical', energyCost: 15, baseGain: 5, description: 'Raja dari latihan kekuatan.' },

  { id: 'parkour', label: 'Parkour', stat: 'dexterity', category: 'physical', energyCost: 5, baseGain: 1, description: 'Latihan ketangkasan seluruh tubuh.' },
  { id: 'juggling', label: 'Juggling', stat: 'dexterity', category: 'physical', energyCost: 10, baseGain: 3, description: 'Refleks tajam melalui gerakan kompleks.' },
  { id: 'obstacle_course', label: 'Lintasan Rintangan', stat: 'dexterity', category: 'physical', energyCost: 15, baseGain: 5, description: 'Latihan level pro untuk kelincahan.' },

  { id: 'endurance_run', label: 'Lari Ketahanan', stat: 'constitution', category: 'physical', energyCost: 5, baseGain: 1, description: 'Lari jarak jauh untuk membangun stamina.' },
  { id: 'sparring', label: 'Sparring', stat: 'constitution', category: 'physical', energyCost: 10, baseGain: 3, description: 'Sparring dengan partner untuk menguatkan tubuh.' },
  { id: 'iron_body', label: 'Tubuh Baja', stat: 'constitution', category: 'physical', energyCost: 15, baseGain: 5, description: 'Latih tubuh untuk menahan damage.' },

  // ── Mental (INT, WIS) ──
  { id: 'reading', label: 'Membaca', stat: 'intelligence', category: 'mental', energyCost: 5, baseGain: 1, description: 'Baca buku untuk melatih otak.' },
  { id: 'puzzles', label: 'Teka-teki', stat: 'intelligence', category: 'mental', energyCost: 10, baseGain: 3, description: 'Selesaikan puzzle logika yang menantang.' },
  { id: 'chess', label: 'Catur', stat: 'intelligence', category: 'mental', energyCost: 15, baseGain: 5, description: 'Mainkan catur untuk strategi tingkat tinggi.' },

  { id: 'meditation', label: 'Meditasi', stat: 'wisdom', category: 'mental', energyCost: 5, baseGain: 1, description: 'Jernihkan pikiran dan tingkatkan kebijaksanaan.' },
  { id: 'yoga', label: 'Yoga', stat: 'wisdom', category: 'mental', energyCost: 10, baseGain: 3, description: 'Latihan keseimbangan jiwa dan raga.' },
  { id: 'breathing', label: 'Latihan Pernapasan', stat: 'wisdom', category: 'mental', energyCost: 15, baseGain: 5, description: 'Teknik pernapasan tingkat lanjut.' },

  // ── Special (CHA, LCK, PER) ──
  { id: 'debate', label: 'Debat', stat: 'charisma', category: 'special', energyCost: 5, baseGain: 1, description: 'Latih kemampuan berbicara dan meyakinkan orang.' },
  { id: 'speech', label: 'Pidato', stat: 'charisma', category: 'special', energyCost: 10, baseGain: 3, description: 'Pidato di depan umum untuk meningkatkan karisma.' },
  { id: 'negotiation', label: 'Negosiasi', stat: 'charisma', category: 'special', energyCost: 15, baseGain: 5, description: 'Latihan negosiasi level ahli.' },

  { id: 'dice_throw', label: 'Lempar Dadu', stat: 'luck', category: 'special', energyCost: 5, baseGain: 1, description: 'Lempar dadu dan percaya pada keberuntunganmu.' },
  { id: 'card_games', label: 'Permainan Kartu', stat: 'luck', category: 'special', energyCost: 10, baseGain: 3, description: 'Main kartu untuk melatih intuisi.' },
  { id: 'coin_flip', label: 'Latihan Koin', stat: 'luck', category: 'special', energyCost: 15, baseGain: 5, description: 'Konsentrasi penuh pada keberuntungan murni.' },

  { id: 'observation', label: 'Observasi', stat: 'perception', category: 'special', energyCost: 5, baseGain: 1, description: 'Latihan mengamati lingkungan sekitar.' },
  { id: 'tracking', label: 'Pelacakan', stat: 'perception', category: 'special', energyCost: 10, baseGain: 3, description: 'Lacak jejak dan temukan petunjuk tersembunyi.' },
  { id: 'target_practice', label: 'Latihan Menembak', stat: 'perception', category: 'special', energyCost: 15, baseGain: 5, description: 'Tingkatkan ketajaman mata dan fokus.' },
]
