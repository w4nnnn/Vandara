// ─── STATS UTILITIES ────────────────────────────────────────────────────────
// Functions for calculating derived stats, checking synergies, and validating equipment
// 8 Core Stats: STR, DEX, CON, INT, WIS, CHA, LCK, PER

import type { DerivedStats, ActiveSynergy, ItemDef } from '../types'
import { STAT_SYNERGIES } from '../constants/synergies'

export interface BaseStats {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  luck: number
  perception: number
}

/**
 * Get level-based multiplier for stat scaling
 */
export function getLevelMultiplier(level: number): number {
  if (level < 6) return 0.5
  if (level < 11) return 0.75
  if (level < 21) return 1.0
  return 1.25
}

/**
 * Soft cap formula using exponential decay
 * Returns a value approaching `cap` as `input` increases
 */
function softCap(input: number, cap: number, rate: number): number {
  return cap * (1 - Math.exp(-input * rate))
}

/**
 * Calculate max stats (resource pools) from base stats with level scaling
 * Stored in the player table
 */
export function calculateMaxStats(stats: BaseStats & { level: number }) {
  const { strength, constitution, wisdom, charisma, perception, level } = stats
  const multiplier = getLevelMultiplier(level)

  const maxHealth = Math.floor((80 + (constitution * 2.0) + (strength * 0.5)) * multiplier)
  const maxEnergy = Math.floor((60 + (constitution * 1.2) + (wisdom * 0.8)) * multiplier)
  const maxNerve = Math.floor((30 + (wisdom * 1.0) + (perception * 0.5)) * multiplier)
  const maxHappy = Math.floor((50 + (charisma * 1.0) + (wisdom * 0.6)) * multiplier)

  return { maxHealth, maxEnergy, maxNerve, maxHappy }
}

/**
 * Calculate derived combat stats from base stats (no level multiplier)
 * Uses soft cap for natural feeling progression
 */
export function calculateDerivedStats(stats: BaseStats): DerivedStats {
  const { strength, dexterity, constitution, perception, luck } = stats

  // critChance: LCK primary + DEX secondary (soft cap ~35%)
  const critChance = softCap(luck * 0.015 + dexterity * 0.008, 35, 1)

  // dodgeChance: DEX primary + PER secondary (soft cap ~30%)
  const dodgeChance = softCap(dexterity * 0.018 + perception * 0.006, 30, 1)

  // accuracy: DEX primary + PER secondary (base 5%, soft cap ~98%)
  const accuracy = softCap(dexterity * 0.02 + perception * 0.01, 95, 1) + 5

  // blockChance: CON primary + STR secondary (soft cap ~25%)
  const blockChance = softCap(constitution * 0.015 + strength * 0.005, 25, 1)

  // Max stats without level multiplier for UI display
  const maxHealth = Math.floor(80 + (constitution * 2.0) + (strength * 0.5))
  const maxEnergy = Math.floor(60 + (constitution * 1.2) + (stats.wisdom * 0.8))
  const maxNerve = Math.floor(30 + (stats.wisdom * 1.0) + (perception * 0.5))
  const maxHappy = Math.floor(50 + (stats.charisma * 1.0) + (stats.wisdom * 0.6))

  return {
    maxHealth,
    maxEnergy,
    maxNerve,
    maxHappy,
    critChance: Math.round(critChance * 100) / 100,
    dodgeChance: Math.round(dodgeChance * 100) / 100,
    accuracy: Math.round(accuracy * 100) / 100,
    blockChance: Math.round(blockChance * 100) / 100,
  }
}

/**
 * Check which synergies are active based on current stats (tiered system)
 * Returns the highest active tier per synergy
 */
export function checkSynergies(stats: BaseStats): ActiveSynergy[] {
  const active: ActiveSynergy[] = []

  for (const [synergyKey, synergyDef] of Object.entries(STAT_SYNERGIES)) {
    let bestTier = -1
    for (let i = synergyDef.tiers.length - 1; i >= 0; i--) {
      const tier = synergyDef.tiers[i]
      const met = Object.entries(tier.requires).every(([stat, value]) => {
        const statValue = stats[stat as keyof BaseStats]
        return statValue !== undefined && statValue >= value
      })
      if (met) {
        bestTier = i
        break
      }
    }

    if (bestTier >= 0) {
      const tier = synergyDef.tiers[bestTier]
      active.push({
        id: synergyKey,
        tier: bestTier + 1,
        label: tier.label,
        bonus: tier.bonus,
      })
    }
  }

  return active
}

/**
 * Check if a player can equip an item based on stat requirements
 */
export function canEquipItem(
  player: BaseStats & { level: number },
  item: ItemDef
): { can: boolean; missing: string[] } {
  const requirements = item.requirements
  if (!requirements) {
    return { can: true, missing: [] }
  }

  const missing: string[] = []
  const statNames: Record<string, string> = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA',
    luck: 'LCK',
    perception: 'PER',
    level: 'Level',
  }

  for (const [stat, required] of Object.entries(requirements)) {
    if (required === undefined) continue
    const playerStat = player[stat as keyof typeof player] as number
    if (playerStat < required) {
      missing.push(`${statNames[stat] || stat} ${playerStat}/${required}`)
    }
  }

  return {
    can: missing.length === 0,
    missing,
  }
}

/**
 * Apply synergy bonuses to derived stats
 */
export function applySynergyBonuses(
  derivedStats: DerivedStats,
  activeSynergies: ActiveSynergy[]
): DerivedStats {
  let result = { ...derivedStats }

  for (const synergy of activeSynergies) {
    const { bonus } = synergy

    if (bonus.maxHp !== undefined) {
      result.maxHealth = Math.floor(result.maxHealth * (1 + bonus.maxHp))
    }
    if (bonus.critChance !== undefined) {
      result.critChance = Math.min(result.critChance + (bonus.critChance * 100), 35)
    }
    if (bonus.dodgeChance !== undefined) {
      result.dodgeChance = Math.min(result.dodgeChance + (bonus.dodgeChance * 100), 30)
    }
    if (bonus.blockChance !== undefined) {
      result.blockChance = Math.min(result.blockChance + (bonus.blockChance * 100), 25)
    }
    if (bonus.accuracy !== undefined) {
      result.accuracy = Math.min(result.accuracy + (bonus.accuracy * 100), 100)
    }
  }

  return result
}

/**
 * Get formatted synergy display info
 */
export function getSynergyDisplayInfo(synergy: ActiveSynergy): {
  name: string
  label: string
  color: string
  icon: string
} {
  const synergyInfo: Record<string, { name: string; color: string; icon: string }> = {
    warrior: { name: 'Warrior', color: 'text-red-500', icon: '⚔️' },
    shadow: { name: 'Shadow', color: 'text-purple-500', icon: '🗡️' },
    tank: { name: 'Tank', color: 'text-blue-500', icon: '🛡️' },
    scholar: { name: 'Scholar', color: 'text-cyan-500', icon: '📚' },
    survivor: { name: 'Survivor', color: 'text-green-500', icon: '🎒' },
    hustler: { name: 'Hustler', color: 'text-yellow-500', icon: '💰' },
    sentinel: { name: 'Sentinel', color: 'text-orange-500', icon: '👁️' },
    trickster: { name: 'Trickster', color: 'text-pink-500', icon: '🎲' },
  }

  const info = synergyInfo[synergy.id] || { name: synergy.id, color: 'text-muted-foreground', icon: '✨' }

  return {
    name: info.name,
    label: synergy.label,
    color: info.color,
    icon: info.icon,
  }
}
