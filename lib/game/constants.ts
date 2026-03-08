
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
  /** Scavenge tool effects */
  toolEffect?: {
    nothingReduction?: number    // reduce "nothing" chance by %
    moneyBonus?: number          // multiply money by this factor
    rareBonus?: number           // increase rare/epic drop chance by %
    materialBonus?: number       // increase material drop chance by %
  }
  /** Equipment combat bonuses */
  combatBonus?: CombatBonus
  equipSlot?: EquipmentSlot
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
  // ── Weapons ──
  pipe_wrench: { id: 'pipe_wrench', label: 'Kunci Pipa', category: 'weapon', rarity: 'uncommon', description: 'Senjata improv sederhana tapi efektif.', value: 200, equipSlot: 'weapon', combatBonus: { attack: 5 } },
  combat_knife: { id: 'combat_knife', label: 'Pisau Tempur', category: 'weapon', rarity: 'rare', description: 'Pisau tajam untuk pertarungan jarak dekat.', value: 600, equipSlot: 'weapon', combatBonus: { attack: 12, speed: 3 } },
  taser: { id: 'taser', label: 'Taser', category: 'weapon', rarity: 'epic', description: 'Setrum musuh, buat mereka lambat.', value: 1500, equipSlot: 'weapon', combatBonus: { attack: 18, dexterity: 5 } },
  // ── Armor ──
  leather_jacket: { id: 'leather_jacket', label: 'Jaket Kulit', category: 'armor', rarity: 'uncommon', description: 'Perlindungan dasar yang bergaya.', value: 350, equipSlot: 'armor', combatBonus: { defense: 5, maxHp: 10 } },
  kevlar_vest: { id: 'kevlar_vest', label: 'Rompi Kevlar', category: 'armor', rarity: 'epic', description: 'Pelindung berat anti-peluru.', value: 2000, equipSlot: 'armor', combatBonus: { defense: 18, maxHp: 30 } },
  // ── Accessories ──
  lucky_charm: { id: 'lucky_charm', label: 'Jimat Keberuntungan', category: 'accessory', rarity: 'rare', description: 'Meningkatkan keberuntungan keseluruhan.', value: 800, equipSlot: 'accessory', combatBonus: { dexterity: 5, speed: 3 } },
  gold_ring: { id: 'gold_ring', label: 'Cincin Emas', category: 'accessory', rarity: 'epic', description: 'Cincin mewah yang meningkatkan semua stat.', value: 3000, equipSlot: 'accessory', combatBonus: { attack: 5, defense: 5, speed: 3, dexterity: 3 } },
  // ── Advanced Consumables ──
  advanced_medkit: { id: 'advanced_medkit', label: 'Medkit Lanjut', category: 'consumable', rarity: 'epic', description: 'Memulihkan 150 kesehatan.', value: 700, effect: { stat: 'health', amount: 150 } },
  super_energy: { id: 'super_energy', label: 'Super Energy', category: 'consumable', rarity: 'rare', description: 'Memulihkan 75 energi.', value: 500, effect: { stat: 'energy', amount: 75 } },
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

// ─── SCAVENGE SPOTS ──────────────────────────────────────────────

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

export const SCAVENGE_SPOTS: Record<LocationId, ScavengeSpot[]> = {
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
    facilities: ['Beranda', 'Inventaris', 'Memulung', 'Toko', 'Properti', 'NPC'],
  },
  gym_district: {
    id: 'gym_district',
    label: 'Distrik Gym',
    description: 'Distrik penuh fasilitas latihan dan dojo.',
    facilities: ['Gym', 'Memulung', 'NPC'],
  },
  business_district: {
    id: 'business_district',
    label: 'Distrik Bisnis',
    description: 'Kantor perusahaan dan peluang kerja.',
    facilities: ['Kerja', 'Memulung', 'Properti', 'NPC'],
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

export const ACTIVITY_LOCATIONS: Record<string, LocationId> = {
  gym: 'gym_district',
  jobs: 'business_district',
  combat: 'dark_alley',
  hospital: 'hospital',
}

// Facility name → route + icon key (icons resolved in client code)
export const FACILITY_ROUTES: Record<string, { href: string; iconKey: string }> = {
  'Beranda': { href: '/dashboard', iconKey: 'LayoutDashboard' },
  'Inventaris': { href: '/inventory', iconKey: 'Backpack' },
  'Memulung': { href: '/scavenge', iconKey: 'Search' },
  'Toko': { href: '/shop', iconKey: 'Store' },
  'Properti': { href: '/properties', iconKey: 'Building' },
  'NPC': { href: '/npc', iconKey: 'Users' },
  'Gym': { href: '/gym', iconKey: 'Dumbbell' },
  'Kerja': { href: '/jobs', iconKey: 'Briefcase' },
  'Rumah Sakit': { href: '/hospital', iconKey: 'HeartPulse' },
}

// ─── QUESTS ──────────────────────────────────────────────────────

export type QuestObjective = 'scavenge' | 'combat_win' | 'gym_train' | 'job_work' | 'travel' | 'craft' | 'shop_buy'

export interface QuestDef {
  id: string
  label: string
  description: string
  objective: QuestObjective
  target: number             // how many times
  locationId?: LocationId    // optional location requirement
  rewards: {
    money?: number
    xp?: number
    itemId?: string
    itemQty?: number
    reputation?: { locationId: LocationId; amount: number }
  }
}

export const DAILY_QUESTS: QuestDef[] = [
  {
    id: 'q_scavenge_5', label: 'Pemulung Rajin', description: 'Mulung 5 kali di lokasi manapun.', objective: 'scavenge', target: 5,
    rewards: { money: 500, xp: 50 }
  },
  {
    id: 'q_combat_3', label: 'Petarung Jalanan', description: 'Menangkan 3 pertarungan NPC.', objective: 'combat_win', target: 3,
    rewards: { money: 1000, xp: 80, reputation: { locationId: 'dark_alley', amount: 20 } }
  },
  {
    id: 'q_gym_3', label: 'Atlet Pemula', description: 'Latihan di gym 3 kali.', objective: 'gym_train', target: 3,
    rewards: { money: 300, xp: 40, itemId: 'protein_shake', itemQty: 1 }
  },
  {
    id: 'q_job_2', label: 'Pekerja Keras', description: 'Bekerja 2 kali.', objective: 'job_work', target: 2,
    rewards: { money: 800, xp: 60 }
  },
  {
    id: 'q_travel_3', label: 'Penjelajah', description: 'Travel ke 3 lokasi berbeda.', objective: 'travel', target: 3,
    rewards: { money: 300, xp: 30 }
  },
  {
    id: 'q_scavenge_da', label: 'Penjelajah Gelap', description: 'Mulung 3 kali di Dark Alley.', objective: 'scavenge', target: 3, locationId: 'dark_alley',
    rewards: { money: 700, xp: 60, reputation: { locationId: 'dark_alley', amount: 15 } }
  },
  {
    id: 'q_craft_1', label: 'Pengrajin', description: 'Craft 1 item apapun.', objective: 'craft', target: 1,
    rewards: { money: 400, xp: 50 }
  },
  {
    id: 'q_shop_2', label: 'Pembeli Setia', description: 'Beli 2 item dari toko.', objective: 'shop_buy', target: 2,
    rewards: { money: 200, xp: 30 }
  },
]

export const DAILY_QUEST_COUNT = 3 // how many quests assigned per day

// ─── CRAFTING ────────────────────────────────────────────────────

export interface CraftingRecipe {
  id: string
  label: string
  inputs: { itemId: string; quantity: number }[]
  output: { itemId: string; quantity: number }
  levelRequired: number       // player level
  scavengeLevelRequired: number
  category: 'weapon' | 'armor' | 'consumable' | 'tool'
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  // Weapons
  {
    id: 'craft_pipe_wrench', label: 'Kunci Pipa', category: 'weapon',
    inputs: [{ itemId: 'scrap_metal', quantity: 5 }, { itemId: 'rusty_screw', quantity: 3 }],
    output: { itemId: 'pipe_wrench', quantity: 1 }, levelRequired: 3, scavengeLevelRequired: 2
  },
  {
    id: 'craft_combat_knife', label: 'Pisau Tempur', category: 'weapon',
    inputs: [{ itemId: 'scrap_metal', quantity: 8 }, { itemId: 'rusty_shiv', quantity: 2 }, { itemId: 'torn_fabric', quantity: 3 }],
    output: { itemId: 'combat_knife', quantity: 1 }, levelRequired: 6, scavengeLevelRequired: 4
  },
  {
    id: 'craft_taser', label: 'Taser', category: 'weapon',
    inputs: [{ itemId: 'old_battery', quantity: 8 }, { itemId: 'scrap_metal', quantity: 5 }, { itemId: 'broken_plastic', quantity: 4 }],
    output: { itemId: 'taser', quantity: 1 }, levelRequired: 10, scavengeLevelRequired: 6
  },
  // Armor
  {
    id: 'craft_leather_jacket', label: 'Jaket Kulit', category: 'armor',
    inputs: [{ itemId: 'torn_fabric', quantity: 8 }, { itemId: 'rusty_screw', quantity: 4 }],
    output: { itemId: 'leather_jacket', quantity: 1 }, levelRequired: 4, scavengeLevelRequired: 3
  },
  {
    id: 'craft_kevlar_vest', label: 'Rompi Kevlar', category: 'armor',
    inputs: [{ itemId: 'scrap_metal', quantity: 12 }, { itemId: 'torn_fabric', quantity: 10 }, { itemId: 'broken_plastic', quantity: 6 }],
    output: { itemId: 'kevlar_vest', quantity: 1 }, levelRequired: 12, scavengeLevelRequired: 7
  },
  // Consumables
  {
    id: 'craft_adv_medkit', label: 'Medkit Lanjut', category: 'consumable',
    inputs: [{ itemId: 'medkit', quantity: 1 }, { itemId: 'bandages', quantity: 3 }, { itemId: 'old_battery', quantity: 2 }],
    output: { itemId: 'advanced_medkit', quantity: 1 }, levelRequired: 8, scavengeLevelRequired: 5
  },
  {
    id: 'craft_super_energy', label: 'Super Energy', category: 'consumable',
    inputs: [{ itemId: 'energy_drink', quantity: 2 }, { itemId: 'protein_shake', quantity: 1 }],
    output: { itemId: 'super_energy', quantity: 1 }, levelRequired: 5, scavengeLevelRequired: 3
  },
]

// ─── SKILL TREES ─────────────────────────────────────────────────

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

// ─── EQUIPMENT ───────────────────────────────────────────────────

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory' | 'tool'

export const EQUIPMENT_SLOTS: EquipmentSlot[] = ['weapon', 'armor', 'accessory', 'tool']

export interface CombatBonus {
  attack?: number
  defense?: number
  speed?: number
  dexterity?: number
  maxHp?: number
}

export function getEquipmentBonuses(player: {
  equippedWeapon?: string | null
  equippedArmor?: string | null
  equippedAccessory?: string | null
}): CombatBonus {
  const combined: CombatBonus = {}
  const slots = [player.equippedWeapon, player.equippedArmor, player.equippedAccessory]
  for (const itemId of slots) {
    if (!itemId) continue
    const def = ITEMS[itemId]
    if (!def?.combatBonus) continue
    for (const [key, val] of Object.entries(def.combatBonus)) {
      ; (combined as any)[key] = ((combined as any)[key] ?? 0) + (val as number)
    }
  }
  return combined
}

// ─── MINI-GAMES ──────────────────────────────────────────────────

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

export const MINI_GAMES: MiniGameDef[] = [
  { id: 'coin_flip', label: 'Lempar Koin', description: 'Tebak sisi koin. Menang = 2x taruhan.', icon: 'Coins', minBet: 50, maxBet: 5000, nerveCost: 1 },
  { id: 'number_guess', label: 'Tebak Angka', description: 'Tebak angka 1-10. Tepat = 8x taruhan.', icon: 'Dices', minBet: 50, maxBet: 2000, nerveCost: 2 },
  { id: 'lockpick', label: 'Bongkar Kunci', description: 'Pilih pin yang benar. Berhasil = item + uang.', icon: 'KeyRound', minBet: 100, maxBet: 3000, nerveCost: 3, locationId: 'dark_alley' },
]

// ─── REPUTATION ──────────────────────────────────────────────────

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
