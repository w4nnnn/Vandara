// ─── STAT SYNERGIES (Tiered) ────────────────────────────────────────────────
// Combo bonuses when multiple stats reach certain thresholds
// Each synergy has 3 tiers for progressive rewards

import type { StatSynergyDef } from '../types'
import type { BaseStats } from '../utils/stats'

export const STAT_SYNERGIES: Record<string, StatSynergyDef> = {
  // Warrior: STR + CON — melee damage & block
  warrior: {
    tiers: [
      { requires: { strength: 25, constitution: 25 }, bonus: { meleeDamage: 0.05 }, label: '+5% melee damage' },
      { requires: { strength: 50, constitution: 50 }, bonus: { meleeDamage: 0.10, blockChance: 0.05 }, label: '+10% melee damage, +5% block' },
      { requires: { strength: 80, constitution: 80 }, bonus: { meleeDamage: 0.15, blockChance: 0.10 }, label: '+15% melee damage, +10% block' },
    ],
  },

  // Shadow: DEX + LCK — crit & dodge
  shadow: {
    tiers: [
      { requires: { dexterity: 25, luck: 25 }, bonus: { critChance: 0.05 }, label: '+5% crit chance' },
      { requires: { dexterity: 50, luck: 50 }, bonus: { critChance: 0.12, dodgeChance: 0.05 }, label: '+12% crit, +5% dodge' },
      { requires: { dexterity: 80, luck: 80 }, bonus: { critChance: 0.20, dodgeChance: 0.15 }, label: '+20% crit, +15% dodge' },
    ],
  },

  // Tank: CON + STR — max HP
  tank: {
    tiers: [
      { requires: { constitution: 30, strength: 20 }, bonus: { maxHp: 0.10 }, label: '+10% max HP' },
      { requires: { constitution: 55, strength: 40 }, bonus: { maxHp: 0.20, blockChance: 0.05 }, label: '+20% max HP, +5% block' },
      { requires: { constitution: 85, strength: 60 }, bonus: { maxHp: 0.30, blockChance: 0.10, defense: 0.10 }, label: '+30% max HP, +10% block' },
    ],
  },

  // Scholar: INT + WIS — XP & energy efficiency
  scholar: {
    tiers: [
      { requires: { intelligence: 25, wisdom: 25 }, bonus: { energyCost: -0.05 }, label: '-5% energy cost' },
      { requires: { intelligence: 50, wisdom: 50 }, bonus: { energyCost: -0.10 }, label: '-10% energy cost' },
      { requires: { intelligence: 80, wisdom: 80 }, bonus: { energyCost: -0.15, accuracy: 0.05 }, label: '-15% energy cost, +5% accuracy' },
    ],
  },

  // Survivor: CON + PER — scavenge & endurance
  survivor: {
    tiers: [
      { requires: { constitution: 25, perception: 25 }, bonus: { lootQuality: 0.10 }, label: '+10% loot quality' },
      { requires: { constitution: 50, perception: 50 }, bonus: { lootQuality: 0.20, maxHp: 0.05 }, label: '+20% loot quality, +5% max HP' },
      { requires: { constitution: 80, perception: 80 }, bonus: { lootQuality: 0.30, maxHp: 0.10 }, label: '+30% loot quality, +10% max HP' },
    ],
  },

  // Hustler: CHA + INT — money & social
  hustler: {
    tiers: [
      { requires: { charisma: 25, intelligence: 25 }, bonus: { meleeDamage: 0.03 }, label: '+3% income bonus' },
      { requires: { charisma: 50, intelligence: 50 }, bonus: { meleeDamage: 0.06, energyCost: -0.05 }, label: '+6% income, -5% energy cost' },
      { requires: { charisma: 80, intelligence: 80 }, bonus: { meleeDamage: 0.10, energyCost: -0.10 }, label: '+10% income, -10% energy cost' },
    ],
  },

  // Sentinel: PER + WIS — awareness & defense
  sentinel: {
    tiers: [
      { requires: { perception: 25, wisdom: 25 }, bonus: { accuracy: 0.05 }, label: '+5% accuracy' },
      { requires: { perception: 50, wisdom: 50 }, bonus: { accuracy: 0.10, dodgeChance: 0.05 }, label: '+10% accuracy, +5% dodge' },
      { requires: { perception: 80, wisdom: 80 }, bonus: { accuracy: 0.15, dodgeChance: 0.10, blockChance: 0.05 }, label: '+15% accuracy, +10% dodge, +5% block' },
    ],
  },

  // Trickster: LCK + CHA — luck & surprise
  trickster: {
    tiers: [
      { requires: { luck: 25, charisma: 25 }, bonus: { critDamage: 0.10 }, label: '+10% crit damage' },
      { requires: { luck: 50, charisma: 50 }, bonus: { critDamage: 0.20, critChance: 0.05 }, label: '+20% crit damage, +5% crit' },
      { requires: { luck: 80, charisma: 80 }, bonus: { critDamage: 0.35, critChance: 0.10 }, label: '+35% crit damage, +10% crit' },
    ],
  },
}

/**
 * Get synergy by ID
 */
export function getSynergy(id: string): StatSynergyDef | undefined {
  return STAT_SYNERGIES[id]
}

/**
 * Get all synergy IDs
 */
export function getSynergyIds(): string[] {
  return Object.keys(STAT_SYNERGIES)
}

/**
 * Check if a synergy's specific tier is active given current stats
 */
export function isSynergyTierActive(id: string, tier: number, stats: BaseStats): boolean {
  const synergy = STAT_SYNERGIES[id]
  if (!synergy || tier < 0 || tier >= synergy.tiers.length) return false

  const tierDef = synergy.tiers[tier]
  return Object.entries(tierDef.requires).every(([stat, value]) => {
    const statValue = stats[stat as keyof BaseStats]
    return statValue !== undefined && statValue >= value
  })
}
