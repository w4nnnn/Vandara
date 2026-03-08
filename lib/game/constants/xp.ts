

// XP required to reach a given level
export const XP_BASE = 100
export const XP_EXPONENT = 1.5

export function xpForLevel(level: number): number {
  return Math.floor(XP_BASE * Math.pow(level, XP_EXPONENT))
}

export function levelFromXP(totalXP: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= totalXP) {
    level++
  }
  return level
}

// Regeneration rates
export const ENERGY_REGEN_RATE = 5
export const ENERGY_REGEN_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export const NERVE_REGEN_RATE = 1
export const NERVE_REGEN_INTERVAL_MS = 3 * 60 * 1000 // 3 minutes

export const HAPPY_REGEN_RATE = 5
export const HAPPY_REGEN_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export const HEALTH_REGEN_RATE = 5
export const HEALTH_REGEN_INTERVAL_MS = 5 * 60 * 1000 // 3 minutes

