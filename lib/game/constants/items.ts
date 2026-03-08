import { CombatBonus, EquipmentSlot } from './equipment'

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
