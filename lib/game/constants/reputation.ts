export interface ReputationLevel {
  level: number
  label: string
  minRep: number
  color: string
  bonus: {
    shopDiscount?: number   // % discount
    xpMultiplier?: number   // e.g. 1.05 = +5%
    scavengeBonus?: number  // +% useful loot
  }
}

export const REPUTATION_LEVELS: ReputationLevel[] = [
  { level: 0, label: 'Orang Asing', minRep: 0, color: 'text-muted-foreground', bonus: {} },
  { level: 1, label: 'Dikenal', minRep: 100, color: 'text-green-500', bonus: { shopDiscount: 3, xpMultiplier: 1.02 } },
  { level: 2, label: 'Dipercaya', minRep: 500, color: 'text-blue-500', bonus: { shopDiscount: 7, xpMultiplier: 1.05, scavengeBonus: 5 } },
  { level: 3, label: 'Dihormati', minRep: 1500, color: 'text-purple-500', bonus: { shopDiscount: 12, xpMultiplier: 1.1, scavengeBonus: 10 } },
  { level: 4, label: 'Legenda', minRep: 5000, color: 'text-yellow-500', bonus: { shopDiscount: 20, xpMultiplier: 1.15, scavengeBonus: 15 } },
]

export function getRepLevel(rep: number): ReputationLevel {
  let result = REPUTATION_LEVELS[0]
  for (const lvl of REPUTATION_LEVELS) {
    if (rep >= lvl.minRep) result = lvl
  }
  return result
}

export const REP_GAINS: Record<string, number> = {
  scavenge: 2,
  combat_win: 5,
  combat_lose: 1,
  job_work: 3,
  gym_train: 1,
  shop_buy: 2,
  craft: 3,
}
