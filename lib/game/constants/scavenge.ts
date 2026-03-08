import { ITEMS } from './items'
import { LocationId } from './locations'

export const SCAVENGE_TOOL_IDS = ['flashlight', 'metal_detector', 'lucky_gloves'] as const
export type ScavengeToolId = (typeof SCAVENGE_TOOL_IDS)[number]



export interface RecycleRecipe {
  id: string
  inputs: { itemId: string; quantity: number }[]
  output: { itemId: string; quantity: number }
  scavengeLevelRequired: number
}

export const RECYCLE_RECIPES: RecycleRecipe[] = [
  {
    id: 'recycle_scrap',
    inputs: [{ itemId: 'rusty_screw', quantity: 3 }, { itemId: 'broken_plastic', quantity: 2 }],
    output: { itemId: 'scrap_metal', quantity: 1 },
    scavengeLevelRequired: 1,
  },
  {
    id: 'recycle_bandages',
    inputs: [{ itemId: 'torn_fabric', quantity: 4 }],
    output: { itemId: 'bandages', quantity: 1 },
    scavengeLevelRequired: 2,
  },
  {
    id: 'recycle_energy',
    inputs: [{ itemId: 'old_battery', quantity: 3 }, { itemId: 'broken_plastic', quantity: 1 }],
    output: { itemId: 'energy_drink', quantity: 1 },
    scavengeLevelRequired: 3,
  },
  {
    id: 'craft_flashlight',
    inputs: [{ itemId: 'old_battery', quantity: 5 }, { itemId: 'scrap_metal', quantity: 3 }, { itemId: 'broken_plastic', quantity: 2 }],
    output: { itemId: 'flashlight', quantity: 1 },
    scavengeLevelRequired: 3,
  },
  {
    id: 'craft_metal_detector',
    inputs: [{ itemId: 'scrap_metal', quantity: 10 }, { itemId: 'old_battery', quantity: 5 }, { itemId: 'rusty_screw', quantity: 8 }],
    output: { itemId: 'metal_detector', quantity: 1 },
    scavengeLevelRequired: 5,
  },
  {
    id: 'craft_lucky_gloves',
    inputs: [{ itemId: 'torn_fabric', quantity: 10 }, { itemId: 'rusty_shiv', quantity: 2 }, { itemId: 'old_watch', quantity: 1 }],
    output: { itemId: 'lucky_gloves', quantity: 1 },
    scavengeLevelRequired: 7,
  },
]



export type ScavengeEventType = 'treasure_chest' | 'danger' | 'npc_trade' | 'crit'

export interface ScavengeEvent {
  type: ScavengeEventType
  chance: number // % chance per scavenge action
}

export const SCAVENGE_EVENTS: ScavengeEvent[] = [
  { type: 'crit', chance: 8 },
  { type: 'treasure_chest', chance: 5 },
  { type: 'danger', chance: 7 },
  { type: 'npc_trade', chance: 4 },
]



// streak now grants a flat 0.5% loot bonus per consecutive action
// event bonus remains fixed small (+0.02 per streak for flavor)
export function getStreakBonus(streak: number): { lootBonus: number; eventBonus: number } {
  const lootBonus = streak * 0.005 // 0.5% per streak
  const eventBonus = streak * 0.02 // 2% per streak (optional)
  return { lootBonus, eventBonus }
}



// (moved below SCAVENGE_ENERGY_COST)




export const SCAVENGE_ENERGY_COST = 2
export const SCAVENGE_XP_PER_ACTION = 5 // base XP (added on top of item-based XP)
export const SCAVENGE_XP_BASE = 50
export const SCAVENGE_XP_EXPONENT = 1.4

export const DOUBLE_ENERGY_COST = SCAVENGE_ENERGY_COST * 2
export const DOUBLE_SCAVENGE_LOOT_SHIFT = 0.3 // shift 30% of junk/none chance to useful items

// XP calculation based on loot value
export function getScavengeXpForLoot(loot: { money?: number; itemId?: string; quantity?: number }): number {
  if ('money' in loot && loot.money !== undefined) {
    // Money: 1 XP per $5 earned
    return Math.max(1, Math.floor(loot.money / 5))
  }
  if ('itemId' in loot && loot.itemId) {
    const def = ITEMS[loot.itemId]
    if (!def) return 1
    // Item: XP = item value / 5, scaled by quantity
    const qty = loot.quantity ?? 1
    return Math.max(1, Math.floor((def.value * qty) / 5))
  }
  return 1 // nothing found = 1 XP
}



export interface SpotLootMod {
  nothingReduction?: number  // reduce "nothing" chance by %
  moneyBonus?: number        // multiply money amount (e.g. 1.5 = +50%)
  materialBonus?: number     // increase material item chance by %
  junkReduction?: number     // reduce junk chance by %
  rareBonus?: number         // increase rare/epic item chance by %
  boostedLootIds?: string[]  // specific loot entry IDs to boost (1.8x chance)
}

export interface ScavengeSpot {
  id: string
  label: string
  icon: string
  hint: string
  lootMod: SpotLootMod
}

export const SCAVENGE_SPOTS: Partial<Record<LocationId, ScavengeSpot[]>> = {
  city_center: [
    {
      id: 'trash_bin', label: 'Tempat Sampah', icon: 'Trash2', hint: 'Junk sedikit, energi naik',
      lootMod: { junkReduction: 20, boostedLootIds: ['cc_energy', 'cc_happy'] }
    },
    {
      id: 'park_bench', label: 'Bangku Taman', icon: 'TreePine', hint: 'Kosong berkurang, happy naik',
      lootMod: { nothingReduction: 30, boostedLootIds: ['cc_happy'] }
    },
    {
      id: 'bus_stop', label: 'Halte Bus', icon: 'Bus', hint: 'Uang x1.5',
      lootMod: { moneyBonus: 1.5, boostedLootIds: ['cc_money'] }
    },
    {
      id: 'alley_corner', label: 'Sudut Gang', icon: 'CornerDownRight', hint: 'Energi & uang naik',
      lootMod: { boostedLootIds: ['cc_energy', 'cc_money'] }
    },
  ],
  gym_district: [
    {
      id: 'locker_room', label: 'Ruang Loker', icon: 'DoorOpen', hint: 'Protein & energi naik',
      lootMod: { rareBonus: 20, boostedLootIds: ['gd_protein', 'gd_energy'] }
    },
    {
      id: 'dumpster', label: 'Tempat Sampah Besar', icon: 'Container', hint: 'Kosong & junk turun',
      lootMod: { junkReduction: 15, nothingReduction: 15, boostedLootIds: ['gd_protein'] }
    },
    {
      id: 'parking_lot', label: 'Tempat Parkir', icon: 'Car', hint: 'Uang x1.3',
      lootMod: { moneyBonus: 1.3, boostedLootIds: ['gd_money'] }
    },
  ],
  business_district: [
    {
      id: 'office_trash', label: 'Tong Sampah Kantor', icon: 'Building2', hint: 'Koper & material naik',
      lootMod: { materialBonus: 40, boostedLootIds: ['bd_briefcase', 'bd_nerve'] }
    },
    {
      id: 'terminal', label: 'Terminal Komputer', icon: 'Monitor', hint: 'Uang x2, jam tangan naik',
      lootMod: { moneyBonus: 2.0, junkReduction: 30, boostedLootIds: ['bd_money', 'bd_watch'] }
    },
    {
      id: 'reception', label: 'Meja Resepsionis', icon: 'Landmark', hint: 'Kosong turun, nerve naik',
      lootMod: { nothingReduction: 40, boostedLootIds: ['bd_nerve', 'bd_briefcase'] }
    },
  ],
  dark_alley: [
    {
      id: 'dumpster_da', label: 'Kontainer Sampah', icon: 'Container', hint: 'Scrap & shiv naik',
      lootMod: { junkReduction: 20, boostedLootIds: ['da_scrap', 'da_shiv'] }
    },
    {
      id: 'abandoned_car', label: 'Mobil Terlantar', icon: 'Car', hint: 'Jam tangan & scrap naik',
      lootMod: { materialBonus: 30, boostedLootIds: ['da_oldwatch', 'da_scrap'] }
    },
    {
      id: 'sewer_grate', label: 'Saluran Got', icon: 'Droplets', hint: 'Uang x1.5, shiv naik',
      lootMod: { moneyBonus: 1.5, boostedLootIds: ['da_money', 'da_shiv'] }
    },
    {
      id: 'hidden_stash', label: 'Simpanan Rahasia', icon: 'Eye', hint: 'Jam tangan & langka naik besar',
      lootMod: { rareBonus: 35, nothingReduction: 20, boostedLootIds: ['da_oldwatch', 'da_shiv'] }
    },
  ],
  hospital: [
    {
      id: 'waiting_room', label: 'Ruang Tunggu', icon: 'Clock', hint: 'Kosong turun, perban naik',
      lootMod: { nothingReduction: 25, boostedLootIds: ['hp_bandages'] }
    },
    {
      id: 'supply_closet', label: 'Lemari Persediaan', icon: 'Package', hint: 'Medkit & ramuan naik',
      lootMod: { rareBonus: 25, materialBonus: 20, boostedLootIds: ['hp_medkit', 'hp_potion'] }
    },
    {
      id: 'parking_garage', label: 'Garasi Parkir', icon: 'Warehouse', hint: 'Uang x1.3, perban naik',
      lootMod: { moneyBonus: 1.3, junkReduction: 15, boostedLootIds: ['hp_money', 'hp_bandages'] }
    },
  ],
}

// list of actual junk item IDs used for randomization
export const JUNK_IDS = ['rusty_screw', 'broken_plastic', 'old_battery', 'torn_fabric'] as const
export type JunkId = (typeof JUNK_IDS)[number]

export function scavengeXpForLevel(level: number): number {
  return Math.floor(SCAVENGE_XP_BASE * Math.pow(level, SCAVENGE_XP_EXPONENT))
}

export function scavengeLevelFromXP(totalXP: number): number {
  let level = 1
  while (scavengeXpForLevel(level + 1) <= totalXP) {
    level++
  }
  return level
}

export interface LootEntry {
  id: string
  type: 'item' | 'money' | 'none'
  itemId?: string
  moneyMin?: number
  moneyMax?: number
  baseChance: number       // base % chance (0-100)
  levelBonus: number       // additional % per scavenge level above 1
  maxChance: number        // cap %
  quantityMin?: number
  quantityMax?: number
}

export const SCAVENGE_LOOT_TABLES: Partial<Record<LocationId, LootEntry[]>> = {
  city_center: [
    { id: 'cc_nothing', type: 'none', baseChance: 15, levelBonus: -2, maxChance: 60 },
    { id: 'cc_money', type: 'money', moneyMin: 5, moneyMax: 25, baseChance: 20, levelBonus: -2, maxChance: 50 },
    { id: 'cc_junk', type: 'item', itemId: 'junk', baseChance: 50, levelBonus: 1, maxChance: 70 },
    { id: 'cc_energy', type: 'item', itemId: 'energy_drink', baseChance: 10, levelBonus: 1.5, maxChance: 40 },
    { id: 'cc_happy', type: 'item', itemId: 'happy_meal', baseChance: 5, levelBonus: 1, maxChance: 25 },
  ],
  gym_district: [
    { id: 'gd_nothing', type: 'none', baseChance: 15, levelBonus: -2, maxChance: 60 },
    { id: 'gd_money', type: 'money', moneyMin: 5, moneyMax: 15, baseChance: 15, levelBonus: -2, maxChance: 50 },
    { id: 'gd_junk', type: 'item', itemId: 'junk', baseChance: 60, levelBonus: 1, maxChance: 80 },
    { id: 'gd_protein', type: 'item', itemId: 'protein_shake', baseChance: 15, levelBonus: 1.5, maxChance: 50 },
    { id: 'gd_energy', type: 'item', itemId: 'energy_drink', baseChance: 5, levelBonus: 1, maxChance: 30 },
  ],
  business_district: [
    { id: 'bd_nothing', type: 'none', baseChance: 15, levelBonus: -3, maxChance: 60 },
    { id: 'bd_money', type: 'money', moneyMin: 10, moneyMax: 50, baseChance: 60, levelBonus: -3, maxChance: 60 },
    { id: 'bd_briefcase', type: 'item', itemId: 'briefcase', baseChance: 20, levelBonus: 1.5, maxChance: 35 },
    { id: 'bd_watch', type: 'item', itemId: 'expensive_watch', baseChance: 8, levelBonus: 1, maxChance: 25 },
    { id: 'bd_nerve', type: 'item', itemId: 'nerve_pill', baseChance: 12, levelBonus: 0.5, maxChance: 20 },
  ],
  dark_alley: [
    { id: 'da_nothing', type: 'none', baseChance: 15, levelBonus: -3, maxChance: 60 },
    { id: 'da_money', type: 'money', moneyMin: 10, moneyMax: 30, baseChance: 15, levelBonus: -3, maxChance: 50 },
    { id: 'da_junk', type: 'item', itemId: 'junk', baseChance: 60, levelBonus: 1.2, maxChance: 80 },
    { id: 'da_scrap', type: 'item', itemId: 'scrap_metal', baseChance: 25, levelBonus: 1, maxChance: 35, quantityMin: 1, quantityMax: 3 },
    { id: 'da_shiv', type: 'item', itemId: 'rusty_shiv', baseChance: 10, levelBonus: 1, maxChance: 25 },
    { id: 'da_oldwatch', type: 'item', itemId: 'old_watch', baseChance: 15, levelBonus: 1, maxChance: 25 },
  ],
  hospital: [
    { id: 'hp_nothing', type: 'none', baseChance: 15, levelBonus: -2, maxChance: 60 },
    { id: 'hp_money', type: 'money', moneyMin: 5, moneyMax: 20, baseChance: 45, levelBonus: -2, maxChance: 45 },
    { id: 'hp_bandages', type: 'item', itemId: 'bandages', baseChance: 30, levelBonus: 1.5, maxChance: 45 },
    { id: 'hp_medkit', type: 'item', itemId: 'medkit', baseChance: 10, levelBonus: 1, maxChance: 25 },
    { id: 'hp_potion', type: 'item', itemId: 'small_potion', baseChance: 15, levelBonus: 0.5, maxChance: 20 },
  ],
}

/** Calculate actual drop chances for a location at a given scavenge level */
export function getScavengeChances(locationId: LocationId, scavengeLevel: number): { entry: LootEntry; chance: number }[] {
  const table = SCAVENGE_LOOT_TABLES[locationId]
  if (!table) return []

  // compute raw chances including level bonuses/caps
  let rawChances = table.map(entry => {
    const raw = Math.min(
      entry.baseChance + entry.levelBonus * (scavengeLevel - 1),
      entry.maxChance
    )
    return { entry, chance: Math.max(raw, 0) } // allow 0
  })

  // as player levels up, we want junk+none to shrink and other categories to grow
  if (scavengeLevel > 1) {
    const decreaseFactor = 0.02 * (scavengeLevel - 1) // 2% per level, adjustable
    let reduction = 0

    rawChances = rawChances.map(r => {
      if (r.entry.type === 'none' || (r.entry.type === 'item' && r.entry.itemId === 'junk')) {
        const drop = r.chance * decreaseFactor
        reduction += drop
        return { entry: r.entry, chance: r.chance - drop }
      }
      return r
    })

    // redistribute reduction proportionally to non-junk/none entries
    const growables = rawChances.filter(r => !(r.entry.type === 'none' || (r.entry.type === 'item' && r.entry.itemId === 'junk')))
    const growTotal = growables.reduce((sum, r) => sum + r.chance, 0)
    if (growTotal > 0) {
      rawChances = rawChances.map(r => {
        if (!(r.entry.type === 'none' || (r.entry.type === 'item' && r.entry.itemId === 'junk'))) {
          return { entry: r.entry, chance: r.chance + (r.chance / growTotal) * reduction }
        }
        return r
      })
    }
  }

  // Normalize to 100%
  const total = rawChances.reduce((sum, r) => sum + r.chance, 0)
  return rawChances.map(r => ({
    entry: r.entry,
    chance: Math.round((r.chance / total) * 10000) / 100, // 2 decimal places
  }))
}
