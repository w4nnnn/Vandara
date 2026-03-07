
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
  energy_drink: { id: 'energy_drink', label: 'Minuman Energi', category: 'consumable', description: 'Memulihkan 25 energi.', value: 100, effect: { stat: 'energy', amount: 25 } },
  small_potion: { id: 'small_potion', label: 'Ramuan Kecil', category: 'consumable', description: 'Memulihkan 50 kesehatan.', value: 200, effect: { stat: 'health', amount: 50 } },
  large_potion: { id: 'large_potion', label: 'Ramuan Besar', category: 'consumable', description: 'Memulihkan 100 kesehatan.', value: 500, effect: { stat: 'health', amount: 100 } },
  nerve_pill: { id: 'nerve_pill', label: 'Pil Keberanian', category: 'consumable', description: 'Memulihkan 10 keberanian.', value: 150, effect: { stat: 'nerve', amount: 10 } },
  happy_meal: { id: 'happy_meal', label: 'Makanan Enak', category: 'consumable', description: 'Memulihkan 30 kebahagiaan.', value: 120, effect: { stat: 'happy', amount: 30 } },
  protein_shake: { id: 'protein_shake', label: 'Protein Shake', category: 'booster', description: 'Gandakan hasil latihan gym berikutnya.', value: 300 },
  scrap_metal: { id: 'scrap_metal', label: 'Besi Rongsokan', category: 'material', description: 'Bahan tukar yang bernilai uang.', value: 25 },
  old_watch: { id: 'old_watch', label: 'Jam Tangan Lama', category: 'material', description: 'Barang koleksi kecil.', value: 75 },
  expensive_watch: { id: 'expensive_watch', label: 'Jam Tangan Mahal', category: 'material', description: 'Terlihat seperti emas asli. Jual mahal.', value: 500 },
  briefcase: { id: 'briefcase', label: 'Koper', category: 'material', description: 'Koper kulit yang elegan.', value: 150 },
  rusty_shiv: { id: 'rusty_shiv', label: 'Pisau Karatan', category: 'material', description: 'Bukan senjata hebat, tapi kolektor mungkin mau beli.', value: 40 },
  bandages: { id: 'bandages', label: 'Perban', category: 'consumable', description: 'Memulihkan 20 kesehatan.', value: 50, effect: { stat: 'health', amount: 20 } },
  medkit: { id: 'medkit', label: 'Kotak P3K', category: 'consumable', description: 'Memulihkan 75 kesehatan.', value: 300, effect: { stat: 'health', amount: 75 } },
}

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
