export type JailCrime = 'pickpocket_fail' | 'crime_caught' | 'faction_war_loss'

export interface JailActivityDef {
  id: string
  label: string
  description: string
  energyCost: number
  reductionSeconds: number   // how much time is reduced
  cooldownMs: number
  chance: number             // success chance 0-1
}

export const JAIL_ACTIVITIES: JailActivityDef[] = [
  {
    id: 'workout', label: 'Olahraga', description: 'Latihan push-up dan sit-up di sel.',
    energyCost: 5, reductionSeconds: 30, cooldownMs: 60 * 1000, chance: 0.9,
  },
  {
    id: 'bribe_guard', label: 'Suap Penjaga', description: 'Coba sogok penjaga untuk keluar lebih cepat.',
    energyCost: 10, reductionSeconds: 120, cooldownMs: 5 * 60 * 1000, chance: 0.4,
  },
  {
    id: 'good_behavior', label: 'Kelakuan Baik', description: 'Tunjukkan perilaku baik untuk pengurangan hukuman.',
    energyCost: 3, reductionSeconds: 60, cooldownMs: 3 * 60 * 1000, chance: 0.7,
  },
  {
    id: 'escape_attempt', label: 'Coba Kabur', description: 'Nekat kabur. Berhasil = bebas, gagal = tambah waktu.',
    energyCost: 20, reductionSeconds: 9999, cooldownMs: 10 * 60 * 1000, chance: 0.15,
  },
]

export const JAIL_DURATIONS: Record<JailCrime, number> = {
  pickpocket_fail: 120,     // 2 minutes
  crime_caught: 300,         // 5 minutes
  faction_war_loss: 180,     // 3 minutes
}
