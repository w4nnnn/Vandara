export interface SpecialMove {
  id: string
  label: string
  description: string
  energyCost: number
  nerveCost: number
  damageMultiplier: number
  accuracyModifier: number   // e.g. -0.2 = 20% less accurate
  effect?: 'stun' | 'bleed' | 'heal'
  effectChance?: number
  levelRequired: number
  skillRequired?: string     // skill tree skill id
}

export const SPECIAL_MOVES: SpecialMove[] = [
  {
    id: 'power_strike', label: 'Pukulan Tenaga', description: 'Serangan penuh tenaga. 1.8x damage, akurasi berkurang.',
    energyCost: 0, nerveCost: 0, damageMultiplier: 1.8, accuracyModifier: -0.15,
    levelRequired: 3,
  },
  {
    id: 'leg_sweep', label: 'Sapuan Kaki', description: 'Tendang kaki musuh. 1.2x damage, 30% stun.',
    energyCost: 0, nerveCost: 0, damageMultiplier: 1.2, accuracyModifier: 0,
    effect: 'stun', effectChance: 0.3, levelRequired: 5,
  },
  {
    id: 'blade_fury', label: 'Amukan Pisau', description: 'Serangan bertubi-tubi. 2.2x damage, akurasi rendah.',
    energyCost: 0, nerveCost: 0, damageMultiplier: 2.2, accuracyModifier: -0.3,
    effect: 'bleed', effectChance: 0.4, levelRequired: 8, skillRequired: 'c_power1',
  },
  {
    id: 'emergency_heal', label: 'Pertolongan Darurat', description: 'Pulihkan 15% HP, skip serangan.',
    energyCost: 0, nerveCost: 0, damageMultiplier: 0, accuracyModifier: 0,
    effect: 'heal', effectChance: 1.0, levelRequired: 6,
  },
  {
    id: 'critical_aim', label: 'Bidik Mematikan', description: 'Bidik titik vital. 2.5x damage, sangat tidak akurat.',
    energyCost: 0, nerveCost: 0, damageMultiplier: 2.5, accuracyModifier: -0.4,
    levelRequired: 12, skillRequired: 'c_crit',
  },
]
