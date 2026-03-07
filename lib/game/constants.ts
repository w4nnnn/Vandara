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
export const ENERGY_REGEN_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

export const NERVE_REGEN_RATE = 1
export const NERVE_REGEN_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export const HAPPY_REGEN_RATE = 5
export const HAPPY_REGEN_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes

export const HEALTH_REGEN_RATE = 5
export const HEALTH_REGEN_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

// Avatar option values
export const AVATAR_OPTIONS = {
  topType: [
    'NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban',
    'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4',
    'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly',
    'LongHairCurvy', 'LongHairDreads', 'LongHairFrida', 'LongHairFro',
    'LongHairFroBand', 'LongHairMiaWallace', 'LongHairNotTooLong',
    'LongHairShavedSides', 'LongHairStraight', 'LongHairStraight2',
    'LongHairStraightStrand', 'ShortHairDreads01', 'ShortHairDreads02',
    'ShortHairFrizzle', 'ShortHairShaggyMullet', 'ShortHairShortCurly',
    'ShortHairShortFlat', 'ShortHairShortRound', 'ShortHairShortWaved',
    'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart',
  ],
  accessoriesType: [
    'Blank', 'Kurt', 'Prescription01', 'Prescription02',
    'Round', 'Sunglasses', 'Wayfarers',
  ],
  hatColor: [
    'Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02',
    'Heather', 'PastelBlue', 'PastelGreen', 'PastelOrange',
    'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White',
  ],
  hairColor: [
    'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown',
    'BrownDark', 'PastelPink', 'Blue', 'Platinum', 'Red', 'SilverGray',
  ],
  facialHairType: [
    'Blank', 'BeardMedium', 'BeardLight', 'BeardMajestic',
    'MoustacheFancy', 'MoustacheMagnum',
  ],
  facialHairColor: [
    'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown',
    'BrownDark', 'PastelPink', 'Blue', 'Platinum', 'Red', 'SilverGray',
  ],
  clotheType: [
    'BlazerShirt', 'BlazerSweater', 'CollarSweater', 'GraphicShirt',
    'Hoodie', 'Overall', 'ShirtCrewNeck', 'ShirtScoopNeck', 'ShirtVNeck',
  ],
  clotheColor: [
    'Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02',
    'Heather', 'PastelBlue', 'PastelGreen', 'PastelOrange',
    'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White',
  ],
  graphicType: [
    'Skull', 'SkullOutline', 'Bat', 'Cumbia', 'Deer',
    'Diamond', 'Hola', 'Selena', 'Pizza', 'Resist', 'Bear',
  ],
  eyeType: [
    'Close', 'Cry', 'Default', 'Dizzy', 'EyeRoll', 'Happy',
    'Hearts', 'Side', 'Squint', 'Surprised', 'Wink', 'WinkWacky',
  ],
  eyebrowType: [
    'Angry', 'AngryNatural', 'Default', 'DefaultNatural', 'FlatNatural',
    'RaisedExcited', 'RaisedExcitedNatural', 'SadConcerned',
    'SadConcernedNatural', 'UnibrowNatural', 'UpDown', 'UpDownNatural',
  ],
  mouthType: [
    'Concerned', 'Default', 'Disbelief', 'Eating', 'Grimace',
    'Sad', 'ScreamOpen', 'Serious', 'Smile', 'Tongue', 'Twinkle', 'Vomit',
  ],
  skinColor: [
    'Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black',
  ],
} as const

export type AvatarOptionKey = keyof typeof AVATAR_OPTIONS

// ─── GYM ──────────────────────────────────────────────────────────

export type GymStat = 'strength' | 'defense' | 'speed' | 'dexterity'

export interface GymExercise {
  id: string
  label: string
  stat: GymStat
  energyCost: number
  baseGain: number       // base stat points gained
  description: string
}

export const GYM_EXERCISES: GymExercise[] = [
  { id: 'punch_bag',      label: 'Punching Bag',    stat: 'strength',  energyCost: 5,  baseGain: 1, description: 'Hit the bag to build raw strength.' },
  { id: 'bench_press',    label: 'Bench Press',     stat: 'strength',  energyCost: 10, baseGain: 3, description: 'Heavy presses for serious gains.' },
  { id: 'deadlift',       label: 'Deadlift',        stat: 'strength',  energyCost: 15, baseGain: 5, description: 'The king of strength exercises.' },
  { id: 'dodge_drill',    label: 'Dodge Drill',     stat: 'defense',   energyCost: 5,  baseGain: 1, description: 'Practice dodging incoming attacks.' },
  { id: 'sparring',       label: 'Sparring',        stat: 'defense',   energyCost: 10, baseGain: 3, description: 'Spar with a partner to harden your defense.' },
  { id: 'iron_body',      label: 'Iron Body',       stat: 'defense',   energyCost: 15, baseGain: 5, description: 'Condition your body to resist damage.' },
  { id: 'sprints',        label: 'Sprints',         stat: 'speed',     energyCost: 5,  baseGain: 1, description: 'Short bursts of explosive speed.' },
  { id: 'hurdles',        label: 'Hurdles',         stat: 'speed',     energyCost: 10, baseGain: 3, description: 'Build agility and speed together.' },
  { id: 'wind_sprints',   label: 'Wind Sprints',    stat: 'speed',     energyCost: 15, baseGain: 5, description: 'Push your legs to the limit.' },
  { id: 'target_practice',label: 'Target Practice', stat: 'dexterity', energyCost: 5,  baseGain: 1, description: 'Improve hand-eye coordination.' },
  { id: 'juggling',       label: 'Juggling',        stat: 'dexterity', energyCost: 10, baseGain: 3, description: 'Sharp reflexes through complex motions.' },
  { id: 'obstacle_course',label: 'Obstacle Course', stat: 'dexterity', energyCost: 15, baseGain: 5, description: 'Full-body dexterity training.' },
]

// ─── JOBS ─────────────────────────────────────────────────────────

export interface Job {
  id: string
  label: string
  pay: number           // money per work action
  xp: number            // xp per work action
  nerveCost: number
  levelRequired: number
  description: string
}

export const JOBS: Job[] = [
  { id: 'grocer',       label: 'Grocer',            pay: 50,   xp: 5,  nerveCost: 2,  levelRequired: 1,  description: 'Stack shelves and ring up customers.' },
  { id: 'cashier',      label: 'Cashier',           pay: 80,   xp: 8,  nerveCost: 3,  levelRequired: 2,  description: 'Handle transactions at a busy store.' },
  { id: 'mechanic',     label: 'Mechanic',          pay: 150,  xp: 15, nerveCost: 5,  levelRequired: 5,  description: 'Fix cars and earn decent money.' },
  { id: 'security',     label: 'Security Guard',    pay: 250,  xp: 20, nerveCost: 7,  levelRequired: 8,  description: 'Guard premises. Danger pay included.' },
  { id: 'programmer',   label: 'Programmer',        pay: 400,  xp: 30, nerveCost: 8,  levelRequired: 12, description: 'Write code for a tech company.' },
  { id: 'lawyer',       label: 'Lawyer',            pay: 700,  xp: 50, nerveCost: 10, levelRequired: 18, description: 'Represent clients in court.' },
  { id: 'doctor',       label: 'Doctor',            pay: 1000, xp: 75, nerveCost: 12, levelRequired: 25, description: 'Save lives and earn top dollar.' },
]

// ─── ITEMS ────────────────────────────────────────────────────────

export type ItemCategory = 'consumable' | 'booster' | 'material'

export interface ItemDef {
  id: string
  label: string
  category: ItemCategory
  description: string
  value: number          // sell / buy value
  effect?: {
    stat?: 'energy' | 'nerve' | 'health' | 'happy'
    amount?: number
  }
}

export const ITEMS: Record<string, ItemDef> = {
  energy_drink:  { id: 'energy_drink',  label: 'Energy Drink',  category: 'consumable', description: 'Restores 25 energy.',    value: 100,  effect: { stat: 'energy', amount: 25 } },
  small_potion:  { id: 'small_potion',  label: 'Small Potion',  category: 'consumable', description: 'Restores 50 health.',    value: 200,  effect: { stat: 'health', amount: 50 } },
  large_potion:  { id: 'large_potion',  label: 'Large Potion',  category: 'consumable', description: 'Restores 100 health.',   value: 500,  effect: { stat: 'health', amount: 100 } },
  nerve_pill:    { id: 'nerve_pill',    label: 'Nerve Pill',    category: 'consumable', description: 'Restores 10 nerve.',     value: 150,  effect: { stat: 'nerve',  amount: 10 } },
  happy_meal:    { id: 'happy_meal',    label: 'Happy Meal',    category: 'consumable', description: 'Restores 30 happiness.', value: 120,  effect: { stat: 'happy',  amount: 30 } },
  protein_shake: { id: 'protein_shake', label: 'Protein Shake', category: 'booster',    description: 'Doubles gym gains for the next training.', value: 300 },
  scrap_metal:   { id: 'scrap_metal',   label: 'Scrap Metal',   category: 'material',   description: 'Trade-in material worth some cash.',        value: 25 },
  old_watch:     { id: 'old_watch',     label: 'Old Watch',     category: 'material',   description: 'A collectable trinket.',                    value: 75 },
}
