export type SkillTreeId = 'combat' | 'stealth' | 'trading'

export interface SkillDef {
  id: string
  tree: SkillTreeId
  label: string
  description: string
  cost: number                // skill points needed
  levelRequired: number
  prerequisite?: string       // skill id that must be unlocked first
  bonus: {
    attackPercent?: number    // +% attack
    defensePercent?: number   // +% defense
    critChance?: number       // +% crit
    maxHpBonus?: number       // flat HP bonus
    scavengeLuck?: number     // +% scavenge useful item chance
    dodgeChance?: number      // +% dodge in combat
    stealBonus?: number       // +% money from combat
    shopDiscount?: number     // -% shop prices
    sellBonus?: number        // +% sell prices
    jobPayBonus?: number      // +% job pay
    xpBonus?: number          // +% XP from all actions
  }
}

export const SKILLS: SkillDef[] = [
  // Combat Tree
  {
    id: 'c_power1', tree: 'combat', label: 'Pukulan Keras', description: '+10% serangan', cost: 1, levelRequired: 2,
    bonus: { attackPercent: 10 }
  },
  {
    id: 'c_power2', tree: 'combat', label: 'Pukulan Brutal', description: '+15% serangan', cost: 2, levelRequired: 5, prerequisite: 'c_power1',
    bonus: { attackPercent: 15 }
  },
  {
    id: 'c_crit', tree: 'combat', label: 'Titik Vital', description: '+8% critical hit', cost: 2, levelRequired: 4,
    bonus: { critChance: 8 }
  },
  {
    id: 'c_tank', tree: 'combat', label: 'Badan Baja', description: '+10% pertahanan', cost: 1, levelRequired: 3,
    bonus: { defensePercent: 10 }
  },
  {
    id: 'c_hp', tree: 'combat', label: 'Vitalitas', description: '+25 max HP', cost: 2, levelRequired: 6, prerequisite: 'c_tank',
    bonus: { maxHpBonus: 25 }
  },

  // Stealth Tree
  {
    id: 's_luck1', tree: 'stealth', label: 'Mata Tajam', description: '+10% peluang loot berguna', cost: 1, levelRequired: 2,
    bonus: { scavengeLuck: 10 }
  },
  {
    id: 's_luck2', tree: 'stealth', label: 'Insting Pemulung', description: '+15% peluang loot berguna', cost: 2, levelRequired: 5, prerequisite: 's_luck1',
    bonus: { scavengeLuck: 15 }
  },
  {
    id: 's_dodge', tree: 'stealth', label: 'Refleks Cepat', description: '+10% peluang mengelak', cost: 2, levelRequired: 4,
    bonus: { dodgeChance: 10 }
  },
  {
    id: 's_steal', tree: 'stealth', label: 'Tangan Panjang', description: '+20% uang dari combat', cost: 1, levelRequired: 3,
    bonus: { stealBonus: 20 }
  },
  {
    id: 's_xp', tree: 'stealth', label: 'Cepat Belajar', description: '+10% XP semua aksi', cost: 2, levelRequired: 7, prerequisite: 's_dodge',
    bonus: { xpBonus: 10 }
  },

  // Trading Tree
  {
    id: 't_discount', tree: 'trading', label: 'Negosiator', description: '-10% harga toko', cost: 1, levelRequired: 2,
    bonus: { shopDiscount: 10 }
  },
  {
    id: 't_discount2', tree: 'trading', label: 'Tawar Menawar', description: '-15% harga toko', cost: 2, levelRequired: 6, prerequisite: 't_discount',
    bonus: { shopDiscount: 15 }
  },
  {
    id: 't_sell', tree: 'trading', label: 'Salesmanship', description: '+15% harga jual', cost: 1, levelRequired: 3,
    bonus: { sellBonus: 15 }
  },
  {
    id: 't_job', tree: 'trading', label: 'Koneksi Bisnis', description: '+15% gaji kerja', cost: 2, levelRequired: 5,
    bonus: { jobPayBonus: 15 }
  },
  {
    id: 't_xp', tree: 'trading', label: 'Pengalaman Dagang', description: '+8% XP semua aksi', cost: 2, levelRequired: 7, prerequisite: 't_job',
    bonus: { xpBonus: 8 }
  },
]

export const SKILL_POINTS_PER_LEVEL = 1 // 1 point per level up

export function getSkillBonuses(unlockedSkillIds: string[]): SkillDef['bonus'] {
  const combined: SkillDef['bonus'] = {}
  for (const sid of unlockedSkillIds) {
    const skill = SKILLS.find(s => s.id === sid)
    if (!skill) continue
    for (const [key, val] of Object.entries(skill.bonus)) {
      ; (combined as any)[key] = ((combined as any)[key] ?? 0) + (val as number)
    }
  }
  return combined
}
