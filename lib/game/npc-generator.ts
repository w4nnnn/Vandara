import { AVATAR_OPTIONS, ITEMS } from './constants'

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
function mulberry32(a: number) {
    return function () {
        let t = a += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
}

/**
 * Helper to pick a random item from an array using a PRNG
 */
function pickRandom<T>(arr: readonly T[], prng: () => number): T {
    return arr[Math.floor(prng() * arr.length)]
}

// ─── Data Dictionaries ──────────────────────────────────────────────

const FIRST_NAMES = [
    'Jack', 'Silent', 'Johnny', 'Mad', 'Crazy', 'Big', 'Slick', 'Fast',
    'Iron', 'Tommy', 'Eddie', 'Vinnie', 'Frankie', 'Jimmy', 'Bobby'
]

const LAST_NAMES = [
    'The Ripper', 'Bob', 'Blades', 'Fist', 'Fingers', 'Gunner', 'Shiv',
    'Shark', 'Bones', 'Knuckles', 'Spade', 'The Ghost', 'Trigger'
]

const DESCRIPTIONS = [
    'A tough street fighter who looks ready for a brawl.',
    'Looking around suspiciously, holding something in their pocket.',
    'Scars on their face tell stories of past street fights.',
    'Pacing back and forth, muttering to themselves.',
    'Leaning against the wall, waiting for an easy target.',
    'Looks like they haven\'t slept in days, but still dangerous.',
    'A local thug known for picking fights with strangers.'
]

const GREETINGS = [
    'Apa lihat-lihat? Mau cari masalah?',
    'Heh, kamu lagi apa di sini? Tempat ini nggak aman.',
    'Dompet atau nyawa? Hahaha bercanda. Tapi serius, ada uang?',
    'Berani juga ngelewatin daerah ini.',
    'Nyari gara-gara? Sini lo!',
]

const CHAT_LINES = [
    { npc: 'Gue udah di jalanan sejak kecil. Nggak ada yang peduli sama gue.', replies: ['Pasti berat ya.', 'Makanya kerja yang bener.'] },
    { npc: 'Hidup di jalanan itu keras, bro. Lo harus ambil apa yang lo bisa.', replies: ['Tapi ngerampok itu salah.', 'Gue paham.'] },
    { npc: 'Kadang gue mikir, apa hidup gue bakal berubah kalau gue punya kesempatan.', replies: ['Nggak ada kata terlambat.', 'Mimpi aja.'] },
    { npc: 'Dulu gue petinju amatir. Sampai ada kejadian yang bikin gue dikeluarin.', replies: ['Sayang banget.', 'Pantes pukulan lo keras.'] },
]

const FAREWELLS = [
    'Udah ah, gue mau jalan.',
    'Jangan halangin jalan gue lagi.',
    'Awas lu ya kalau ketemu lagi.',
    'Gue pergi dulu. Ingat muka gue.',
]

// ─── Equipment Pool ──────────────────────────────────────────────────

/** Equippable items available to NPCs, ordered common → epic */
const NPC_WEAPON_POOL = ['pipe_wrench', 'combat_knife', 'taser'] as const
const NPC_ARMOR_POOL = ['leather_jacket', 'kevlar_vest'] as const
const NPC_ACCESSORY_POOL = ['lucky_charm', 'gold_ring'] as const

/**
 * Weighted pick based on NPC level.
 * Low-level NPC → biased toward first (weaker) items.
 * High-level NPC → can pick any item including epic.
 */
function pickEquipmentByLevel<T extends string>(
    pool: readonly T[],
    prng: () => number,
    npcLevel: number
): T {
    const levelFactor = Math.min(npcLevel / 12, 1) // 0..1
    const weights = pool.map((_, i) => {
        const rarity = i / (pool.length - 1 || 1)
        return Math.max(0.05, rarity <= levelFactor ? 1 : (1 - rarity) * (1 - levelFactor) + 0.1)
    })
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let r = prng() * totalWeight
    for (let k = 0; k < pool.length; k++) {
        r -= weights[k]
        if (r <= 0) return pool[k]
    }
    return pool[pool.length - 1]
}

// ─── Interfaces ─────────────────────────────────────────────────────

export type NpcEquipment = {
    weapon?: string
    armor?: string
    accessory?: string
}

export type GeneratedNpc = {
    id: string
    label: string
    level: number
    description: string
    strength: number
    defense: number
    speed: number
    dexterity: number
    maxHealth: number
    nerveCost: number
    moneyDrop: [number, number]
    xpDrop: number
    itemDrops?: { itemId: string; chance: number }[]
    /** Equipment the NPC is carrying — already applied to stats */
    equipment: NpcEquipment
    dialogue: {
        greeting: string
        lines: { npc: string; replies: string[] }[]
        farewell: string
    }
    avatar: Record<string, string>
}

// ─── Core Functions ─────────────────────────────────────────────────

export type ActiveNpc = GeneratedNpc & { nextRotationTime: number }

/**
 * Generates the current array of active NPCs.
 * Each NPC "slot" has its own independent rotation timer.
 * The number of slots changes every hour.
 */
export function getActiveNpcs(playerLevel: number, locationId: string): ActiveNpc[] {
    const npcs: ActiveNpc[] = []
    const now = Date.now()

    // Determine number of slots available for the current hour + location
    const hourMs = 60 * 60 * 1000
    const currentHour = Math.floor(now / hourMs)
    // Combine hour and location string into a numeric seed
    const locationSeed = locationId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const hourPrng = mulberry32(currentHour + locationSeed)

    // Between 3 to 7 NPCs at a time
    const count = 3 + Math.floor(hourPrng() * 5)

    for (let i = 0; i < count; i++) {
        // Each slot has its own rotation duration between 3 to 15 minutes
        const durationMinutes = 3 + Math.floor(hourPrng() * 13)
        const slotDurationMs = durationMinutes * 60 * 1000

        const currentSlotInterval = Math.floor(now / slotDurationMs)
        const nextRotationTime = (currentSlotInterval + 1) * slotDurationMs

        // Seed for this specific NPC at this specific time interval
        const slotSeed = currentSlotInterval * 1000 + i + locationSeed
        const prng = mulberry32(slotSeed)

        // Generate basic identity
        const firstName = pickRandom(FIRST_NAMES, prng)
        const lastName = pickRandom(LAST_NAMES, prng)
        const label = `${firstName} ${lastName}`

        let npcLevel = playerLevel + Math.floor(prng() * 8) - 2
        if (npcLevel < 1) npcLevel = 1

        const id = `npc_${slotSeed}`

        // Location biases
        let equipmentBoost = 1.0
        let statBoost = 1.0
        let moneyBoost = 1.0

        if (locationId === 'gym') {
            statBoost = 1.25 // gym people are stronger
        } else if (locationId === 'downtown' || locationId === 'bank') {
            moneyBoost = 1.5 // rich people downtown
            equipmentBoost = 0.5 // less likely to carry weapons compared to alleys
        } else if (locationId === 'dark_alley') {
            equipmentBoost = 1.3 // more likely to be armed
        }

        // ─── Equipment Generation ─────────────────────────────────────
        // Chance scales with level: min 20% (Lv1) → max 75% (Lv15+)
        const clampedLevel = Math.min(npcLevel, 15)
        const weaponChance = Math.min(0.9, (0.20 + (clampedLevel / 15) * 0.55) * equipmentBoost)
        const armorChance = Math.min(0.9, (0.15 + (clampedLevel / 15) * 0.45) * equipmentBoost)
        const accessoryChance = Math.min(0.9, (0.10 + (clampedLevel / 15) * 0.35) * equipmentBoost)
        const equipment: NpcEquipment = {}
        let equipAttack = 0, equipDefense = 0, equipSpeed = 0, equipDex = 0, equipHp = 0

        if (prng() < weaponChance) {
            const itemId = pickEquipmentByLevel(NPC_WEAPON_POOL, prng, npcLevel)
            equipment.weapon = itemId
            const bonus = ITEMS[itemId]?.combatBonus
            if (bonus) {
                equipAttack += bonus.attack ?? 0
                equipDefense += bonus.defense ?? 0
                equipSpeed += bonus.speed ?? 0
                equipDex += bonus.dexterity ?? 0
                equipHp += bonus.maxHp ?? 0
            }
        }

        if (prng() < armorChance) {
            const itemId = pickEquipmentByLevel(NPC_ARMOR_POOL, prng, npcLevel)
            equipment.armor = itemId
            const bonus = ITEMS[itemId]?.combatBonus
            if (bonus) {
                equipAttack += bonus.attack ?? 0
                equipDefense += bonus.defense ?? 0
                equipSpeed += bonus.speed ?? 0
                equipDex += bonus.dexterity ?? 0
                equipHp += bonus.maxHp ?? 0
            }
        }

        if (prng() < accessoryChance) {
            const itemId = pickEquipmentByLevel(NPC_ACCESSORY_POOL, prng, npcLevel)
            equipment.accessory = itemId
            const bonus = ITEMS[itemId]?.combatBonus
            if (bonus) {
                equipAttack += bonus.attack ?? 0
                equipDefense += bonus.defense ?? 0
                equipSpeed += bonus.speed ?? 0
                equipDex += bonus.dexterity ?? 0
                equipHp += bonus.maxHp ?? 0
            }
        }

        // ─── Base Stats ───────────────────────────────────────────────
        const baseStatPool = (npcLevel * 5 + 10) * statBoost

        let str = 1 + Math.floor(prng() * (baseStatPool * 0.4))
        let def = 1 + Math.floor(prng() * (baseStatPool * 0.4))
        let spd = 1 + Math.floor(prng() * (baseStatPool * 0.4))
        let dex = 1 + Math.floor(prng() * (baseStatPool * 0.4))

        str += Math.floor(npcLevel * 1.5 * statBoost)
        def += Math.floor(npcLevel * 1.2 * statBoost)
        spd += Math.floor(npcLevel * 1.3 * statBoost)
        dex += Math.floor(npcLevel * 1.0 * statBoost)

        // Apply equipment bonuses on top
        str += equipAttack
        def += equipDefense
        spd += equipSpeed
        dex += equipDex

        const maxHealth = 15 + (npcLevel * 8 * statBoost) + (def * 2) + equipHp

        // Generate Avatar
        const avatar: Record<string, string> = {}
        for (const [key, options] of Object.entries(AVATAR_OPTIONS)) {
            avatar[key] = pickRandom(options, prng)
        }

        // Determine rewards & cost
        const nerveCost = Math.max(2, Math.min(10, Math.floor(npcLevel / 3) + 2))
        const minMoney = Math.floor((npcLevel * 5 + Math.floor(prng() * 20)) * moneyBoost)
        // Ensure max is strictly greater than min by at least 1, unless min is 0
        const maxMoneyOffset = npcLevel * 10 + Math.floor(prng() * 50) + 1
        const maxMoney = minMoney + Math.floor(maxMoneyOffset * moneyBoost)
        const xpDrop = Math.floor((npcLevel * 4 + Math.floor(prng() * 10)) * statBoost)

        // Dialogue
        const linesCount = 1 + Math.floor(prng() * 3)
        const lines = []
        const availableChatLines = [...CHAT_LINES]
        for (let j = 0; j < linesCount; j++) {
            if (availableChatLines.length === 0) break
            const idx = Math.floor(prng() * availableChatLines.length)
            lines.push(availableChatLines[idx])
            availableChatLines.splice(idx, 1)
        }

        npcs.push({
            id,
            label,
            level: npcLevel,
            description: pickRandom(DESCRIPTIONS, prng),
            strength: str,
            defense: def,
            speed: spd,
            dexterity: dex,
            maxHealth,
            nerveCost,
            moneyDrop: [minMoney, maxMoney],
            xpDrop,
            itemDrops: prng() > 0.7 ? [{ itemId: 'scrap_metal', chance: 0.5 }] : [],
            equipment,
            dialogue: {
                greeting: pickRandom(GREETINGS, prng),
                lines,
                farewell: pickRandom(FAREWELLS, prng),
            },
            avatar,
            nextRotationTime,
        })
    }

    return npcs.sort((a, b) => a.level - b.level)
}
