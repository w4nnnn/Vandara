
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
  { id: 'punch_bag', label: 'Samsak Tinju', stat: 'strength', energyCost: 5, baseGain: 1, description: 'Pukul samsak untuk melatih kekuatan.' },
  { id: 'bench_press', label: 'Bench Press', stat: 'strength', energyCost: 10, baseGain: 3, description: 'Angkat beban berat untuk peningkatan serius.' },
  { id: 'deadlift', label: 'Deadlift', stat: 'strength', energyCost: 15, baseGain: 5, description: 'Raja dari latihan kekuatan.' },
  { id: 'dodge_drill', label: 'Latihan Menghindar', stat: 'defense', energyCost: 5, baseGain: 1, description: 'Berlatih menghindari serangan.' },
  { id: 'sparring', label: 'Sparring', stat: 'defense', energyCost: 10, baseGain: 3, description: 'Sparring dengan partner untuk menguatkan pertahanan.' },
  { id: 'iron_body', label: 'Tubuh Baja', stat: 'defense', energyCost: 15, baseGain: 5, description: 'Latih tubuh untuk menahan damage.' },
  { id: 'sprints', label: 'Sprint', stat: 'speed', energyCost: 5, baseGain: 1, description: 'Ledakan kecepatan dalam waktu singkat.' },
  { id: 'hurdles', label: 'Lari Rintangan', stat: 'speed', energyCost: 10, baseGain: 3, description: 'Latih kelincahan dan kecepatan bersama.' },
  { id: 'wind_sprints', label: 'Sprint Angin', stat: 'speed', energyCost: 15, baseGain: 5, description: 'Dorong kaki sampai batasnya.' },
  { id: 'target_practice', label: 'Latihan Target', stat: 'dexterity', energyCost: 5, baseGain: 1, description: 'Tingkatkan koordinasi mata-tangan.' },
  { id: 'juggling', label: 'Juggling', stat: 'dexterity', energyCost: 10, baseGain: 3, description: 'Refleks tajam melalui gerakan kompleks.' },
  { id: 'obstacle_course', label: 'Parkour', stat: 'dexterity', energyCost: 15, baseGain: 5, description: 'Latihan ketangkasan seluruh tubuh.' },
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
  { id: 'grocer', label: 'Tukang Sayur', pay: 50, xp: 5, nerveCost: 2, levelRequired: 1, description: 'Tata rak dan layani pelanggan.' },
  { id: 'cashier', label: 'Kasir', pay: 80, xp: 8, nerveCost: 3, levelRequired: 2, description: 'Tangani transaksi di toko ramai.' },
  { id: 'mechanic', label: 'Montir', pay: 150, xp: 15, nerveCost: 5, levelRequired: 5, description: 'Perbaiki mobil dan dapatkan uang lumayan.' },
  { id: 'security', label: 'Satpam', pay: 250, xp: 20, nerveCost: 7, levelRequired: 8, description: 'Jaga gedung. Termasuk tunjangan bahaya.' },
  { id: 'programmer', label: 'Programmer', pay: 400, xp: 30, nerveCost: 8, levelRequired: 12, description: 'Tulis kode untuk perusahaan teknologi.' },
  { id: 'lawyer', label: 'Pengacara', pay: 700, xp: 50, nerveCost: 10, levelRequired: 18, description: 'Wakili klien di pengadilan.' },
  { id: 'doctor', label: 'Dokter', pay: 1000, xp: 75, nerveCost: 12, levelRequired: 25, description: 'Selamatkan nyawa dan dapatkan gaji tertinggi.' },
]

// ─── ITEM RARITY ──────────────────────────────────────────────────

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic'

export const RARITY_ORDER: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic']

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: 'text-muted-foreground border-muted',
  uncommon: 'text-green-500 border-green-500/50',
  rare: 'text-blue-500 border-blue-500/50',
  epic: 'text-purple-500 border-purple-500/50',
}

export const RARITY_BG: Record<ItemRarity, string> = {
  common: 'bg-muted/30',
  uncommon: 'bg-green-500/10',
  rare: 'bg-blue-500/10',
  epic: 'bg-purple-500/10',
}

// ─── ITEMS ────────────────────────────────────────────────────────

export type ItemCategory = 'consumable' | 'booster' | 'material' | 'junk' | 'tool'

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
  /** Scavenge tool effects */
  toolEffect?: {
    nothingReduction?: number    // reduce "nothing" chance by %
    moneyBonus?: number          // multiply money by this factor
    rareBonus?: number           // increase rare/epic drop chance by %
    materialBonus?: number       // increase material drop chance by %
  }
}

export const ITEMS: Record<string, ItemDef> = {
  // ── Consumables ──
  energy_drink: { id: 'energy_drink', label: 'Minuman Energi', category: 'consumable', rarity: 'common', description: 'Memulihkan 25 energi.', value: 100, effect: { stat: 'energy', amount: 25 } },
  small_potion: { id: 'small_potion', label: 'Ramuan Kecil', category: 'consumable', rarity: 'common', description: 'Memulihkan 50 kesehatan.', value: 200, effect: { stat: 'health', amount: 50 } },
  large_potion: { id: 'large_potion', label: 'Ramuan Besar', category: 'consumable', rarity: 'uncommon', description: 'Memulihkan 100 kesehatan.', value: 500, effect: { stat: 'health', amount: 100 } },
  nerve_pill: { id: 'nerve_pill', label: 'Pil Keberanian', category: 'consumable', rarity: 'uncommon', description: 'Memulihkan 10 keberanian.', value: 150, effect: { stat: 'nerve', amount: 10 } },
  happy_meal: { id: 'happy_meal', label: 'Makanan Enak', category: 'consumable', rarity: 'common', description: 'Memulihkan 30 kebahagiaan.', value: 120, effect: { stat: 'happy', amount: 30 } },
  bandages: { id: 'bandages', label: 'Perban', category: 'consumable', rarity: 'common', description: 'Memulihkan 20 kesehatan.', value: 50, effect: { stat: 'health', amount: 20 } },
  medkit: { id: 'medkit', label: 'Kotak P3K', category: 'consumable', rarity: 'rare', description: 'Memulihkan 75 kesehatan.', value: 300, effect: { stat: 'health', amount: 75 } },
  // ── Boosters ──
  protein_shake: { id: 'protein_shake', label: 'Protein Shake', category: 'booster', rarity: 'uncommon', description: 'Gandakan hasil latihan gym berikutnya.', value: 300 },
  // ── Materials ──
  scrap_metal: { id: 'scrap_metal', label: 'Besi Rongsokan', category: 'material', rarity: 'common', description: 'Bahan tukar yang bernilai uang.', value: 25 },
  old_watch: { id: 'old_watch', label: 'Jam Tangan Lama', category: 'material', rarity: 'uncommon', description: 'Barang koleksi kecil.', value: 75 },
  expensive_watch: { id: 'expensive_watch', label: 'Jam Tangan Mahal', category: 'material', rarity: 'epic', description: 'Terlihat seperti emas asli. Jual mahal.', value: 500 },
  briefcase: { id: 'briefcase', label: 'Koper', category: 'material', rarity: 'rare', description: 'Koper kulit yang elegan.', value: 150 },
  rusty_shiv: { id: 'rusty_shiv', label: 'Pisau Karatan', category: 'material', rarity: 'uncommon', description: 'Bukan senjata hebat, tapi kolektor mungkin mau beli.', value: 40 },
  // ── Junk ──
  rusty_screw: { id: 'rusty_screw', label: 'Sekrup Karatan', category: 'junk', rarity: 'common', description: 'Sekrup tua yang korosi, mungkin bisa ditebus.', value: 5 },
  broken_plastic: { id: 'broken_plastic', label: 'Plastik Pecah', category: 'junk', rarity: 'common', description: 'Potongan plastik rusak tanpa fungsi.', value: 2 },
  old_battery: { id: 'old_battery', label: 'Baterai Tua', category: 'junk', rarity: 'common', description: 'Baterai bekas, masih mungkin menghasilkan sedikit uang.', value: 10 },
  torn_fabric: { id: 'torn_fabric', label: 'Kain Robek', category: 'junk', rarity: 'common', description: 'Selembar kain sobek, mungkin bisa disulam kembali.', value: 3 },
  // ── Scavenge Tools (equippable) ──
  flashlight: { id: 'flashlight', label: 'Senter', category: 'tool', rarity: 'uncommon', description: 'Mengurangi peluang tidak menemukan apa-apa saat memulung.', value: 500, toolEffect: { nothingReduction: 30 } },
  metal_detector: { id: 'metal_detector', label: 'Detektor Logam', category: 'tool', rarity: 'rare', description: 'Meningkatkan peluang menemukan material dan uang.', value: 1500, toolEffect: { materialBonus: 25, moneyBonus: 1.3 } },
  lucky_gloves: { id: 'lucky_gloves', label: 'Sarung Tangan Keberuntungan', category: 'tool', rarity: 'epic', description: 'Meningkatkan peluang mendapatkan item langka.', value: 3000, toolEffect: { rareBonus: 20 } },
}

// ─── SCAVENGE TOOLS ───────────────────────────────────────────────

export const SCAVENGE_TOOL_IDS = ['flashlight', 'metal_detector', 'lucky_gloves'] as const
export type ScavengeToolId = (typeof SCAVENGE_TOOL_IDS)[number]

// ─── RECYCLING RECIPES ───────────────────────────────────────────

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

// ─── SCAVENGE EVENTS ─────────────────────────────────────────────

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

// ─── STREAK BONUSES ──────────────────────────────────────────────

// streak now grants a flat 0.5% loot bonus per consecutive action
// event bonus remains fixed small (+0.02 per streak for flavor)
export function getStreakBonus(streak: number): { lootBonus: number; eventBonus: number } {
  const lootBonus = streak * 0.005 // 0.5% per streak
  const eventBonus = streak * 0.02 // 2% per streak (optional)
  return { lootBonus, eventBonus }
}

// ─── STAMINA MULTIPLIER ─────────────────────────────────────────

// (moved below SCAVENGE_ENERGY_COST)


// ─── REAL ESTATE ──────────────────────────────────────────────────

export interface PropertyDef {
  id: string
  label: string
  locationId: string
  cost: number
  incomePerHour: number
  description: string
}

export const PROPERTIES: Record<string, PropertyDef> = {
  apartment_complex: {
    id: 'apartment_complex',
    label: 'Komplek Apartemen',
    locationId: 'city_center',
    cost: 50000,
    incomePerHour: 500,
    description: 'Blok hunian sederhana dengan pendapatan sewa stabil.',
  },
  office_building: {
    id: 'office_building',
    label: 'Gedung Perkantoran',
    locationId: 'business_district',
    cost: 250000,
    incomePerHour: 3000,
    description: 'Properti komersial yang disewakan ke penyewa korporat.',
  },
  nightclub: {
    id: 'nightclub',
    label: 'Klub Neon Lotus',
    locationId: 'dark_alley',
    cost: 1000000,
    incomePerHour: 15000,
    description: 'Klub malam bawah tanah yang menghasilkan uang besar.',
  },
}


// ─── SCAVENGE ─────────────────────────────────────────────────────

export const SCAVENGE_ENERGY_COST = 5
export const SCAVENGE_XP_PER_ACTION = 10
export const SCAVENGE_XP_BASE = 50
export const SCAVENGE_XP_EXPONENT = 1.4

export const DOUBLE_ENERGY_COST = SCAVENGE_ENERGY_COST * 2
export const DOUBLE_SCAVENGE_LOOT_SHIFT = 0.3 // shift 30% of junk/none chance to useful items

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

export const SCAVENGE_LOOT_TABLES: Record<LocationId, LootEntry[]> = {
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


// ─── LOCATIONS ────────────────────────────────────────────────────

export type LocationId = 'city_center' | 'gym_district' | 'business_district' | 'dark_alley' | 'hospital'

export interface Location {
  id: LocationId
  label: string
  description: string
  facilities: string[]  // what you can do here
}

export const LOCATIONS: Record<LocationId, Location> = {
  city_center: {
    id: 'city_center',
    label: 'Pusat Kota',
    description: 'Jantung kota. Titik awal yang aman.',
    facilities: ['Beranda', 'Inventaris', 'Memulung', 'Toko', 'Properti'],
  },
  gym_district: {
    id: 'gym_district',
    label: 'Distrik Gym',
    description: 'Distrik penuh fasilitas latihan dan dojo.',
    facilities: ['Gym', 'Memulung'],
  },
  business_district: {
    id: 'business_district',
    label: 'Distrik Bisnis',
    description: 'Kantor perusahaan dan peluang kerja.',
    facilities: ['Kerja', 'Memulung', 'Properti'],
  },
  dark_alley: {
    id: 'dark_alley',
    label: 'Gang Gelap',
    description: 'Bagian kota yang berbahaya. Hati-hati.',
    facilities: ['NPC', 'Memulung', 'Toko', 'Properti'],
  },
  hospital: {
    id: 'hospital',
    label: 'Rumah Sakit',
    description: 'Rumah sakit kota. Datang untuk pemulihan.',
    facilities: ['Rumah Sakit', 'Memulung'],
  },
}

export const LOCATION_IDS = Object.keys(LOCATIONS) as LocationId[]

// Travel times between locations (in seconds)
// Symmetric: time from A→B = time from B→A
export const TRAVEL_TIMES: Record<LocationId, Record<LocationId, number>> = {
  city_center: { city_center: 0, gym_district: 3, business_district: 4, dark_alley: 6, hospital: 5 },
  gym_district: { city_center: 3, gym_district: 0, business_district: 5, dark_alley: 7, hospital: 6 },
  business_district: { city_center: 4, gym_district: 5, business_district: 0, dark_alley: 8, hospital: 4 },
  dark_alley: { city_center: 6, gym_district: 7, business_district: 8, dark_alley: 0, hospital: 9 },
  hospital: { city_center: 5, gym_district: 6, business_district: 4, dark_alley: 9, hospital: 0 },
}

// Which location is required for each activity
export const ACTIVITY_LOCATIONS: Record<string, LocationId> = {
  gym: 'gym_district',
  jobs: 'business_district',
  combat: 'dark_alley',
  hospital: 'hospital',
}
