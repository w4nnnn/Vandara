'use server'

import { db } from '@/lib/db'
import { players, playerItems, scavengeLogs } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getPlayer } from './character'
import {
    type LocationId,
    type ScavengeEventType,
    type SpotLootMod,
    SCAVENGE_ENERGY_COST,
    SCAVENGE_XP_PER_ACTION,
    SCAVENGE_LOOT_TABLES,
    SCAVENGE_EVENTS,
    SCAVENGE_SPOTS,
    DOUBLE_ENERGY_COST,
    DOUBLE_SCAVENGE_LOOT_SHIFT,
    scavengeXpForLevel,
    getScavengeXpForLoot,
    ITEMS,
    JUNK_IDS,
    getStreakBonus,
    REP_GAINS,
} from '@/lib/game/constants'
import { trackQuestProgress } from './quests'
import { addReputation } from './reputation'

export type LootResult = {
    itemId: string
    quantity: number
} | {
    money: number
}

function rollEvent(streak: number): ScavengeEventType | null {
    const { eventBonus } = getStreakBonus(streak)
    for (const ev of SCAVENGE_EVENTS) {
        if (Math.random() * 100 < ev.chance + eventBonus * 100) {
            return ev.type
        }
    }
    return null
}

function generateLoot(
    locationId: LocationId,
    scavengeLevel: number,
    toolEffect: { nothingReduction?: number; materialBonus?: number; moneyBonus?: number; rareBonus?: number } | null,
    streak: number,
    doubleMode: boolean,
    spotMod: SpotLootMod | null,
): LootResult {
    const table = SCAVENGE_LOOT_TABLES[locationId]
    if (!table) return { money: 5 }

    const { lootBonus } = getStreakBonus(streak)

    // Calculate raw chances with level scaling
    let rawChances = table.map(entry => {
        const raw = Math.min(
            entry.baseChance + entry.levelBonus * (scavengeLevel - 1),
            entry.maxChance
        )
        return { entry, chance: Math.max(raw, 1) }
    })

    // Tool effect: reduce "nothing" chance
    if (toolEffect?.nothingReduction) {
        rawChances = rawChances.map(r => {
            if (r.entry.type === 'none') {
                return { entry: r.entry, chance: r.chance * (1 - toolEffect.nothingReduction! / 100) }
            }
            return r
        })
    }

    // Tool effect: boost material entries
    if (toolEffect?.materialBonus) {
        rawChances = rawChances.map(r => {
            if (r.entry.type === 'item' && r.entry.itemId !== 'junk') {
                const def = ITEMS[r.entry.itemId!]
                if (def?.category === 'material') {
                    return { entry: r.entry, chance: r.chance * (1 + toolEffect.materialBonus! / 100) }
                }
            }
            if (r.entry.type === 'money') {
                return r // money bonus handled separately
            }
            return r
        })
    }

    // Tool effect: boost rare items
    if (toolEffect?.rareBonus) {
        rawChances = rawChances.map(r => {
            if (r.entry.type === 'item' && r.entry.itemId !== 'junk') {
                const def = ITEMS[r.entry.itemId!]
                if (def && (def.rarity === 'rare' || def.rarity === 'epic')) {
                    return { entry: r.entry, chance: r.chance * (1 + toolEffect.rareBonus! / 100) }
                }
            }
            return r
        })
    }

    // ── Spot modifiers ──
    if (spotMod?.nothingReduction) {
        rawChances = rawChances.map(r => {
            if (r.entry.type === 'none') {
                return { entry: r.entry, chance: r.chance * (1 - spotMod.nothingReduction! / 100) }
            }
            return r
        })
    }
    if (spotMod?.junkReduction) {
        rawChances = rawChances.map(r => {
            if (r.entry.type === 'item' && r.entry.itemId === 'junk') {
                return { entry: r.entry, chance: r.chance * (1 - spotMod.junkReduction! / 100) }
            }
            return r
        })
    }
    if (spotMod?.materialBonus) {
        rawChances = rawChances.map(r => {
            if (r.entry.type === 'item' && r.entry.itemId !== 'junk') {
                const def = ITEMS[r.entry.itemId!]
                if (def?.category === 'material') {
                    return { entry: r.entry, chance: r.chance * (1 + spotMod.materialBonus! / 100) }
                }
            }
            return r
        })
    }
    if (spotMod?.rareBonus) {
        rawChances = rawChances.map(r => {
            if (r.entry.type === 'item' && r.entry.itemId !== 'junk') {
                const def = ITEMS[r.entry.itemId!]
                if (def && (def.rarity === 'rare' || def.rarity === 'epic')) {
                    return { entry: r.entry, chance: r.chance * (1 + spotMod.rareBonus! / 100) }
                }
            }
            return r
        })
    }

    // Spot: boost specific loot entries by ID (1.8x multiplier)
    if (spotMod?.boostedLootIds && spotMod.boostedLootIds.length > 0) {
        const boosted = new Set(spotMod.boostedLootIds)
        rawChances = rawChances.map(r => {
            if (boosted.has(r.entry.id)) {
                return { entry: r.entry, chance: r.chance * 1.8 }
            }
            return r
        })
    }

    // Streak bonus: shift junk/none chance to useful items
    if (lootBonus > 0) {
        let reduction = 0
        rawChances = rawChances.map(r => {
            if (r.entry.type === 'none' || (r.entry.type === 'item' && r.entry.itemId === 'junk')) {
                const drop = r.chance * lootBonus
                reduction += drop
                return { entry: r.entry, chance: r.chance - drop }
            }
            return r
        })
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

    // Double mode: shift more junk/none to useful
    if (doubleMode) {
        let reduction = 0
        rawChances = rawChances.map(r => {
            if (r.entry.type === 'none' || (r.entry.type === 'item' && r.entry.itemId === 'junk')) {
                const drop = r.chance * DOUBLE_SCAVENGE_LOOT_SHIFT
                reduction += drop
                return { entry: r.entry, chance: r.chance - drop }
            }
            return r
        })
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

    // Weighted random selection
    const total = rawChances.reduce((sum, r) => sum + r.chance, 0)
    let roll = Math.random() * total
    let selected = rawChances[rawChances.length - 1].entry

    for (const r of rawChances) {
        roll -= r.chance
        if (roll <= 0) {
            selected = r.entry
            break
        }
    }

    // Resolve junk variants
    if (selected.type === 'item' && selected.itemId === 'junk') {
        const realId = JUNK_IDS[Math.floor(Math.random() * JUNK_IDS.length)]
        return { itemId: realId, quantity: 1 }
    } else if (selected.type === 'money') {
        const min = selected.moneyMin ?? 5
        const max = selected.moneyMax ?? 25
        let bonus = 1 + (scavengeLevel - 1) * 0.1
        if (toolEffect?.moneyBonus) bonus *= toolEffect.moneyBonus
        if (spotMod?.moneyBonus) bonus *= spotMod.moneyBonus
        const amount = Math.floor((Math.floor(Math.random() * (max - min + 1)) + min) * bonus)
        return { money: amount }
    } else if (selected.type === 'none') {
        return { money: 0 }
    } else {
        const qMin = selected.quantityMin ?? 1
        const qMax = selected.quantityMax ?? 1
        const quantity = Math.floor(Math.random() * (qMax - qMin + 1)) + qMin
        return { itemId: selected.itemId!, quantity }
    }
}

async function giveItem(playerId: number, itemId: string, quantity: number) {
    const existing = await db.query.playerItems.findFirst({
        where: and(eq(playerItems.playerId, playerId), eq(playerItems.itemId, itemId))
    })
    if (existing) {
        await db.update(playerItems).set({ quantity: existing.quantity + quantity }).where(eq(playerItems.id, existing.id))
    } else {
        await db.insert(playerItems).values({ playerId, itemId, quantity })
    }
}

export async function scavenge(spotId: string | null = null, doubleMode = false, miniGameWon = false) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    if (player.isHospitalized) return { error: 'You cannot scavenge while hospitalized.' }
    if (player.travelingTo) return { error: 'You are traveling.' }

    const energyCost = doubleMode ? DOUBLE_ENERGY_COST : SCAVENGE_ENERGY_COST
    if (player.energy < energyCost) return { error: `Not enough energy. Need ${energyCost}` }

    const locationId = player.currentLocation as LocationId

    // Validate spot (optional but flavor-adding)
    const availableSpots = SCAVENGE_SPOTS[locationId] ?? []
    let selectedSpot = spotId ? availableSpots.find(s => s.id === spotId) : null
    if (!selectedSpot && availableSpots.length > 0) {
        // Pick a random spot if none selected
        selectedSpot = availableSpots[Math.floor(Math.random() * availableSpots.length)]
    }

    const currentLevel = player.scavengeLevel

    // Resolve equipped tool effects
    const toolDef = player.equippedTool ? ITEMS[player.equippedTool] : null
    const toolEffect = toolDef?.toolEffect ?? null

    // Calculate streak
    const sameLocation = player.scavengeStreakLocation === locationId
    const newStreak = sameLocation ? (player.scavengeStreak ?? 0) + 1 : 1

    // Roll for random event
    const event = rollEvent(newStreak)

    // Generate base loot
    let loot = generateLoot(locationId, currentLevel, toolEffect, newStreak, doubleMode, selectedSpot?.lootMod ?? null)

    // Apply event effects
    let eventData: { type: ScavengeEventType; detail?: string } | null = null
    let healthLost = 0
    let energyLost = 0

    if (event) {
        switch (event) {
            case 'crit':
                // Double the loot
                if ('money' in loot) {
                    loot = { money: loot.money * 2 }
                } else {
                    loot = { itemId: loot.itemId, quantity: loot.quantity * 2 }
                }
                eventData = { type: 'crit' }
                break
            case 'treasure_chest':
                // Replace with a better item or bonus money
                loot = { money: Math.floor(50 + Math.random() * 100 * (1 + (currentLevel - 1) * 0.15)) }
                eventData = { type: 'treasure_chest' }
                break
            case 'danger':
                // Lose some HP
                healthLost = Math.floor(10 + Math.random() * 15)
                energyLost = Math.floor(3 + Math.random() * 5)
                eventData = { type: 'danger' }
                break
            case 'npc_trade':
                // NPC offers to trade junk for money
                loot = { money: Math.floor(30 + Math.random() * 70) }
                eventData = { type: 'npc_trade' }
                break
        }
    }

    // Calculate XP gain — base + value-based
    const itemXp = getScavengeXpForLoot(loot)
    const baseXp = doubleMode ? SCAVENGE_XP_PER_ACTION * 2 : SCAVENGE_XP_PER_ACTION
    const xpGain = baseXp + (doubleMode ? itemXp * 2 : itemXp)
    const newXp = player.scavengeXp + xpGain
    const xpNeeded = scavengeXpForLevel(currentLevel + 1)
    const leveledUp = newXp >= xpNeeded
    const newLevel = leveledUp ? currentLevel + 1 : currentLevel

    // Deduct energy & update stats
    const updatedEnergy = Math.max(0, player.energy - energyCost - energyLost)
    const updatedHealth = Math.max(1, player.health - healthLost)
    let updatedMoney = player.money

    if ('money' in loot) {
        // Apply mini-game bonus (+50% money)
        const moneyBonus = miniGameWon ? Math.floor(loot.money * 0.5) : 0
        updatedMoney += loot.money + moneyBonus
        if (moneyBonus > 0) (loot as any).money += moneyBonus
    } else if (miniGameWon && 'quantity' in loot) {
        // Mini-game bonus: +1 item quantity
        loot.quantity += 1
    }

    await db
        .update(players)
        .set({
            energy: updatedEnergy,
            health: updatedHealth,
            money: updatedMoney,
            scavengeXp: newXp,
            scavengeLevel: newLevel,
            scavengeStreak: newStreak,
            scavengeStreakLocation: locationId,
            updatedAt: new Date(),
        })
        .where(eq(players.id, player.id))

    // Give item if applicable
    if (!('money' in loot)) {
        await giveItem(player.id, loot.itemId, loot.quantity)
    }

    // Log scavenge action
    await db.insert(scavengeLogs).values({
        playerId: player.id,
        locationId,
        resultType: 'money' in loot ? (loot.money === 0 ? 'none' : 'money') : 'item',
        itemId: 'itemId' in loot ? loot.itemId : null,
        quantity: 'quantity' in loot ? loot.quantity : null,
        moneyAmount: 'money' in loot ? loot.money : null,
        eventType: eventData?.type ?? null,
        streak: newStreak,
        doubleMode,
    })

    // Quest & reputation tracking
    await trackQuestProgress(player.id, 'scavenge', locationId)
    await addReputation(player.id, locationId, REP_GAINS.scavenge)

    return {
        success: true,
        loot,
        event: eventData,
        streak: newStreak,
        healthLost,
        energyLost,
        xpGained: xpGain,
        leveledUp,
        newLevel,
        newXp,
        xpNeeded: leveledUp ? scavengeXpForLevel(newLevel + 1) : xpNeeded,
        spotLabel: selectedSpot?.label ?? null,
        miniGameWon,
    }
}

export async function equipTool(toolId: string | null) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    if (toolId) {
        const def = ITEMS[toolId]
        if (!def || def.category !== 'tool') return { error: 'Invalid tool' }
        // Check player owns it
        const owned = await db.query.playerItems.findFirst({
            where: and(eq(playerItems.playerId, player.id), eq(playerItems.itemId, toolId))
        })
        if (!owned || owned.quantity < 1) return { error: 'You don\'t own this tool' }
    }

    await db.update(players).set({ equippedTool: toolId, updatedAt: new Date() }).where(eq(players.id, player.id))
    return { success: true, equippedTool: toolId }
}

export async function getScavengeLogs() {
    const player = await getPlayer()
    if (!player) return []

    return db.query.scavengeLogs.findMany({
        where: eq(scavengeLogs.playerId, player.id),
        orderBy: [desc(scavengeLogs.createdAt)],
        limit: 15,
    })
}
