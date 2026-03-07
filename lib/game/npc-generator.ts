import { AVATAR_OPTIONS } from './constants'

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

// ─── Interfaces ─────────────────────────────────────────────────────

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
    dialogue: {
        greeting: string
        lines: { npc: string; replies: string[] }[]
        farewell: string
    }
    avatar: Record<string, string>
}

// ─── Core Functions ─────────────────────────────────────────────────

const ROTATION_MINUTES = 15 // NPCs rotate every 15 minutes

/**
 * Returns the current time-based seed and the next rotation timestamp.
 */
export function getCurrentNpcSeed(): { seed: number; nextRotationTime: number } {
    const now = Date.now()
    const intervalMs = ROTATION_MINUTES * 60 * 1000
    const currentInterval = Math.floor(now / intervalMs)
    const nextRotationTime = (currentInterval + 1) * intervalMs
    return { seed: currentInterval, nextRotationTime }
}

/**
 * Generates an array of NPCs using the given seed and the player's level as a baseline.
 */
export function generateDailyNpcs(seed: number, count: number, playerLevel: number): GeneratedNpc[] {
    const npcs: GeneratedNpc[] = []

    // Use a combination of the time seed and a fixed offset to ensure the sequence
    // is exactly the same for all players with the same seed + count.
    const prng = mulberry32(seed)

    for (let i = 0; i < count; i++) {
        // Generate base attributes
        const firstName = pickRandom(FIRST_NAMES, prng)
        const lastName = pickRandom(LAST_NAMES, prng)
        const label = `${firstName} ${lastName}`

        // Level fluctuates around player level (from playerLevel - 2 up to playerLevel + 5)
        let npcLevel = playerLevel + Math.floor(prng() * 8) - 2
        if (npcLevel < 1) npcLevel = 1

        const id = `npc_${seed}_${i}`

        // Calculate stats based on level
        // A base stat pool that scales with level
        const baseStatPool = npcLevel * 5 + 10

        // Distribute randomly but ensure at least 1 in each
        let str = 1 + Math.floor(prng() * (baseStatPool * 0.4))
        let def = 1 + Math.floor(prng() * (baseStatPool * 0.4))
        let spd = 1 + Math.floor(prng() * (baseStatPool * 0.4))
        let dex = 1 + Math.floor(prng() * (baseStatPool * 0.4))

        // Ensure they scale realistically
        str += Math.floor(npcLevel * 1.5)
        def += Math.floor(npcLevel * 1.2)
        spd += Math.floor(npcLevel * 1.3)
        dex += Math.floor(npcLevel * 1.0)

        const maxHealth = 15 + (npcLevel * 8) + (def * 2)

        // Generate Avatar
        const avatar: Record<string, string> = {}
        for (const [key, options] of Object.entries(AVATAR_OPTIONS)) {
            avatar[key] = pickRandom(options, prng)
        }

        // Determine rewards & cost
        const nerveCost = Math.max(2, Math.min(10, Math.floor(npcLevel / 3) + 2))
        const minMoney = npcLevel * 5 + Math.floor(prng() * 20)
        const maxMoney = minMoney + npcLevel * 10 + Math.floor(prng() * 50)
        const xpDrop = npcLevel * 4 + Math.floor(prng() * 10)

        // Dialogue
        const linesCount = 1 + Math.floor(prng() * 3) // 1 to 3 lines
        const lines = []
        // copy array to pick without replacement
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
            itemDrops: prng() > 0.7 ? [{ itemId: 'scrap_metal', chance: 0.5 }] : [], // 30% chance to have a drop
            dialogue: {
                greeting: pickRandom(GREETINGS, prng),
                lines,
                farewell: pickRandom(FAREWELLS, prng),
            },
            avatar
        })
    }

    // Sort by level ascending
    return npcs.sort((a, b) => a.level - b.level)
}
