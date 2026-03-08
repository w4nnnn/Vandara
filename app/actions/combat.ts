'use server'

import { db } from '@/lib/db'
import { players, combatLogs, playerItems } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getPlayer } from './character'
import { xpForLevel, ITEMS, REP_GAINS, SKILL_POINTS_PER_LEVEL, type LocationId } from '@/lib/game/constants'
import { getActiveNpcs } from '@/lib/game/npc-generator'
import { trackQuestProgress } from './quests'
import { addReputation } from './reputation'

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Step 1 — Validate requirements and deduct nerve.
 * Returns the initial combat state for the client to run turn-by-turn.
 */
export async function initiateCombat(enemyId: string) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    if (player.isHospitalized) {
        return { error: 'You are in the hospital and cannot fight right now.' }
    }

    // Allow fighting in any location now

    const npcs = getActiveNpcs(player.level, player.currentLocation)
    const enemy = npcs.find((e) => e.id === enemyId)
    if (!enemy) return { error: 'Musuh tidak valid atau sudah kadaluarsa (ganti waktu/lokasi)' }

    if (player.nerve < enemy.nerveCost) {
        return { error: 'Not enough nerve.' }
    }

    if (player.health <= 0) {
        return { error: 'You have no health left.' }
    }

    // Deduct nerve upfront
    await db
        .update(players)
        .set({
            nerve: sql`${players.nerve} - ${enemy.nerveCost}`,
            updatedAt: new Date(),
        })
        .where(eq(players.id, player.id))

    return {
        success: true as const,
        playerStats: {
            health: player.health,
            maxHealth: player.maxHealth,
            strength: player.strength,
            defense: player.defense,
            speed: player.speed,
            dexterity: player.dexterity,
        },
        enemyStats: {
            id: enemy.id,
            label: enemy.label,
            health: enemy.maxHealth,
            maxHealth: enemy.maxHealth,
            strength: enemy.strength,
            defense: enemy.defense,
            speed: enemy.speed,
            dexterity: enemy.dexterity,
        },
    }
}

/**
 * Step 2 — After combat finishes on the client, apply the outcome.
 * The server re-validates by checking the enemy data.
 */
export async function finishCombat(
    enemyId: string,
    won: boolean,
    totalDamageDealt: number,
    totalDamageTaken: number,
    finalPlayerHealth: number,
    fled: boolean = false
) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const npcs = getActiveNpcs(player.level, player.currentLocation)
    const enemy = npcs.find((e) => e.id === enemyId)
    if (!enemy) return { error: 'Musuh tidak valid atau sudah kadaluarsa' }

    let moneyEarned = 0
    let xpEarned = 0
    let leveledUp = false
    let newLevel = player.level
    const itemsDropped: { itemId: string }[] = []
    let hospitalized = false
    let hospitalSeconds = 0

    if (won) {
        moneyEarned = randomInt(enemy.moneyDrop[0], enemy.moneyDrop[1])
        xpEarned = enemy.xpDrop

        const newXP = player.experience + xpEarned
        while (xpForLevel(newLevel + 1) <= newXP) {
            newLevel++
        }
        leveledUp = newLevel > player.level

        // Item drops
        if (enemy.itemDrops) {
            for (const drop of enemy.itemDrops) {
                if (Math.random() < drop.chance) {
                    const itemDef = ITEMS[drop.itemId]
                    if (itemDef) {
                        itemsDropped.push({ itemId: drop.itemId })
                        const existing = await db.query.playerItems.findFirst({
                            where: and(
                                eq(playerItems.playerId, player.id),
                                eq(playerItems.itemId, drop.itemId)
                            ),
                        })
                        if (existing) {
                            await db
                                .update(playerItems)
                                .set({ quantity: sql`${playerItems.quantity} + 1` })
                                .where(eq(playerItems.id, existing.id))
                        } else {
                            await db.insert(playerItems).values({
                                playerId: player.id,
                                itemId: drop.itemId,
                                quantity: 1,
                            })
                        }
                    }
                }
            }
        }

        // Clamp final health
        const clampedHealth = Math.max(1, Math.min(finalPlayerHealth, player.maxHealth))

        await db
            .update(players)
            .set({
                health: clampedHealth,
                money: sql`${players.money} + ${moneyEarned}`,
                experience: player.experience + xpEarned,
                level: newLevel,
                updatedAt: new Date(),
            })
            .where(eq(players.id, player.id))
    } else if (fled) {
        // Successfully fled — keep player's current HP, no hospitalization
        const clampedHealth = Math.max(1, Math.min(finalPlayerHealth, player.maxHealth))
        await db
            .update(players)
            .set({
                health: clampedHealth,
                updatedAt: new Date(),
            })
            .where(eq(players.id, player.id))
    } else {
        // Defeated (HP reached 0) → hospitalize
        hospitalSeconds = enemy.level * 30
        const hospitalUntil = new Date(Date.now() + hospitalSeconds * 1000)
        hospitalized = true

        await db
            .update(players)
            .set({
                health: 0,
                isHospitalized: true,
                hospitalUntil,
                updatedAt: new Date(),
            })
            .where(eq(players.id, player.id))
    }

    // Log combat
    await db.insert(combatLogs).values({
        playerId: player.id,
        enemyId: enemy.id,
        won,
        damageDealt: totalDamageDealt,
        damageTaken: totalDamageTaken,
        moneyEarned,
        xpEarned,
    })

    // Quest & reputation tracking
    if (won) {
        if (player.currentLocation === 'dark_alley') {
            await trackQuestProgress(player.id, 'combat_win', 'dark_alley')
            await addReputation(player.id, 'dark_alley', REP_GAINS.combat_win)
        }
        // Award skill points on level up
        if (leveledUp) {
            const levelsGained = newLevel - player.level
            await db.update(players).set({
                skillPoints: sql`${players.skillPoints} + ${levelsGained * SKILL_POINTS_PER_LEVEL}`,
            }).where(eq(players.id, player.id))
        }
    } else {
        if (player.currentLocation === 'dark_alley') {
            await addReputation(player.id, 'dark_alley', REP_GAINS.combat_lose)
        }
    }

    return {
        success: true as const,
        won,
        moneyEarned,
        xpEarned,
        leveledUp,
        newLevel,
        itemsDropped,
        hospitalized,
        hospitalSeconds,
    }
}

export async function pickpocketNPC(enemyId: string) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }
    if (player.isHospitalized) return { error: 'Kamu sedang di rumah sakit!' }
    if (player.health <= 0) return { error: 'Kamu tidak memiliki HP tersisa.' }

    const nerveCost = 3
    if (player.nerve < nerveCost) return { error: `Nerve tidak cukup (Butuh ${nerveCost}).` }

    const npcs = getActiveNpcs(player.level, player.currentLocation)
    const enemy = npcs.find((e) => e.id === enemyId)
    if (!enemy) return { error: 'NPC tidak ditemukan atau sudah pergi.' }

    // Check if interaction was already attempted
    const previousInteraction = await db.query.combatLogs.findFirst({
        where: and(
            eq(combatLogs.playerId, player.id),
            eq(combatLogs.enemyId, enemy.id)
        )
    })

    if (previousInteraction) {
        return { error: 'Orang ini sudah mengenalmu. Kamu tidak bisa mencopetnya lagi.' }
    }

    // Attempt Pickpocket
    const playerScore = player.dexterity + player.speed
    const enemyScore = enemy.dexterity + enemy.speed
    // Minimum 15%, max 85% success rate based on stat ratio
    const chance = Math.max(0.15, Math.min(0.85, 0.4 + ((playerScore - enemyScore) / Math.max(1, enemyScore)) * 0.3))

    // Deduct nerve
    await db.update(players)
        .set({ nerve: sql`${players.nerve} - ${nerveCost}`, updatedAt: new Date() })
        .where(eq(players.id, player.id))

    const isSuccess = Math.random() < chance

    if (isSuccess) {
        const moneyStolen = Math.floor(randomInt(enemy.moneyDrop[0], enemy.moneyDrop[1]) * randomInt(40, 80) / 100)

        await db.update(players)
            .set({ money: sql`${players.money} + ${moneyStolen}` })
            .where(eq(players.id, player.id))

        // Log interaction
        await db.insert(combatLogs).values({
            playerId: player.id,
            enemyId: enemy.id,
            won: true,
            damageDealt: 0,
            damageTaken: 0,
            moneyEarned: moneyStolen,
            xpEarned: 0,
        })

        return { success: true, moneyStolen }
    } else {
        // Punish player drastically (Immediate strike from NPC)
        const damageReceived = Math.floor(enemy.strength * (2 + Math.random() * 2))
        const newHealth = Math.max(0, player.health - damageReceived)

        let hospitalized = false
        const updateData: any = { health: newHealth, updatedAt: new Date() }
        let hospitalSeconds = 0

        if (newHealth <= 0) {
            hospitalized = true
            hospitalSeconds = enemy.level * 30
            updateData.isHospitalized = true
            updateData.hospitalUntil = new Date(Date.now() + hospitalSeconds * 1000)
        }

        await db.update(players).set(updateData).where(eq(players.id, player.id))

        await db.insert(combatLogs).values({
            playerId: player.id,
            enemyId: enemy.id,
            won: false,
            damageDealt: 0,
            damageTaken: damageReceived,
            moneyEarned: 0,
            xpEarned: 0,
        })

        return { success: false, damageReceived, hospitalized, hospitalSeconds }
    }
}
