// ─── TYPES ────────────────────────────────────────────────────────
// Type definitions for game constants

export interface CombatBonus {
  attack?: number
  defense?: number
  speed?: number
  dexterity?: number
  maxHp?: number
}

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory' | 'tool'

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic'

export type ItemCategory = 'consumable' | 'booster' | 'material' | 'junk' | 'tool' | 'weapon' | 'armor' | 'accessory'

export interface ItemDef {
  id: string
  label: string
  category: ItemCategory
  rarity: ItemRarity
  description: string
  value: number
  effect?: {
    stat?: 'energy' | 'nerve' | 'health' | 'happy'
    amount?: number
  }
  toolEffect?: {
    nothingReduction?: number
    moneyBonus?: number
    rareBonus?: number
    materialBonus?: number
  }
  combatBonus?: CombatBonus
  equipSlot?: EquipmentSlot
}

export type GymStat = 'strength' | 'defense' | 'speed' | 'dexterity'

export interface GymExercise {
  id: string
  label: string
  stat: GymStat
  energyCost: number
  baseGain: number
  description: string
}

export interface Job {
  id: string
  label: string
  pay: number
  xp: number
  nerveCost: number
  levelRequired: number
  description: string
}

export interface PropertyDef {
  id: string
  label: string
  locationId: string
  cost: number
  incomePerHour: number
  description: string
}

export interface RecycleRecipe {
  id: string
  inputs: { itemId: string; quantity: number }[]
  output: { itemId: string; quantity: number }
  scavengeLevelRequired: number
}

export type ScavengeEventType = 'treasure_chest' | 'danger' | 'npc_trade' | 'crit'

export interface ScavengeEvent {
  type: ScavengeEventType
  chance: number
}

export interface SpotLootMod {
  nothingReduction?: number
  moneyBonus?: number
  materialBonus?: number
  junkReduction?: number
  rareBonus?: number
  boostedLootIds?: string[]
}

export interface ScavengeSpot {
  id: string
  label: string
  icon: string
  hint: string
  lootMod: SpotLootMod
}

export interface LootEntry {
  id: string
  type: 'item' | 'money' | 'none'
  itemId?: string
  moneyMin?: number
  moneyMax?: number
  baseChance: number
  levelBonus: number
  maxChance: number
  quantityMin?: number
  quantityMax?: number
}

export type LocationId =
  | 'city_center'
  | 'gym_district'
  | 'business_district'
  | 'dark_alley'
  | 'hospital'
  | 'port_docks'
  | 'university_district'
  | 'industrial_zone'
  | 'waterfront'
  | 'underground'

export interface Location {
  id: LocationId
  label: string
  description: string
  facilities: string[]
  levelRequired?: number
}

export interface FacilityRoutes {
  [key: string]: { href: string; iconKey: string }
}

export interface LocationNPC {
  id: string
  name: string
  role: string
  locationId: LocationId
  description: string
  avatar?: string
  dialogue?: string[]
}

export interface Faction {
  id: string
  name: string
  tag: string
  description: string
  levelRequired: number
  territoryBonus?: LocationId
}

export interface EducationCourse {
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

export type QuestObjective = 'scavenge' | 'combat_win' | 'gym_train' | 'job_work' | 'travel' | 'craft' | 'shop_buy'

export interface DailyQuest {
  id: string
  label: string
  description: string
  objective?: QuestObjective
  target: number
  locationId?: LocationId
  rewards: {
    money?: number
    xp?: number
    itemId?: string
    itemQty?: number
    reputation?: { locationId: LocationId; amount: number }
  }
}

export interface QuestDef {
  id: string
  label: string
  description: string
  objective: QuestObjective
  target: number
  locationId?: LocationId
  rewards: {
    money?: number
    xp?: number
    itemId?: string
    itemQty?: number
    reputation?: { locationId: LocationId; amount: number }
  }
}

export interface CraftingRecipe {
  id: string
  label: string
  inputs: { itemId: string; quantity: number }[]
  output: { itemId: string; quantity: number }
  levelRequired: number
  scavengeLevelRequired: number
  category: 'weapon' | 'armor' | 'consumable' | 'tool'
}

export type SkillTreeId = 'combat' | 'stealth' | 'trading'

export interface SkillDef {
  id: string
  tree: SkillTreeId
  label: string
  description: string
  cost: number
  levelRequired: number
  prerequisite?: string
  bonus: {
    attackPercent?: number
    defensePercent?: number
    critChance?: number
    maxHpBonus?: number
    scavengeLuck?: number
    dodgeChance?: number
    stealBonus?: number
    shopDiscount?: number
    sellBonus?: number
    jobPayBonus?: number
    xpBonus?: number
  }
}

export interface MiniGameDef {
  id: string
  label: string
  description: string
  icon: string
  minBet: number
  maxBet: number
  nerveCost: number
  locationId?: LocationId
}

export interface ReputationLevel {
  level: number
  label: string
  minRep: number
  color: string
  bonus: {
    shopDiscount?: number
    xpMultiplier?: number
    scavengeBonus?: number
  }
}

export interface SpecialMove {
  id: string
  label: string
  description: string
  energyCost: number
  nerveCost: number
  damageMultiplier: number
  accuracyModifier: number
  effect?: 'stun' | 'bleed' | 'heal'
  effectChance?: number
  levelRequired: number
  skillRequired?: string
}

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

export type JailCrime = 'pickpocket_fail' | 'crime_caught' | 'faction_war_loss'

export interface JailActivityDef {
  id: string
  label: string
  description: string
  energyCost: number
  reductionSeconds: number
  cooldownMs: number
  chance: number
}

export type AvatarOptionKey = 
  | 'topType'
  | 'accessoriesType'
  | 'hatColor'
  | 'hairColor'
  | 'facialHairType'
  | 'facialHairColor'
  | 'clotheType'
  | 'clotheColor'
  | 'graphicType'
  | 'eyeType'
  | 'eyebrowType'
  | 'mouthType'
  | 'skinColor'
