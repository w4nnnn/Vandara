'use server'

import { db } from '@/lib/db'
import { players, combatLogs, playerItems } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getPlayer } from './character'
import { xpForLevel, ITEMS } from '@/lib/game/constants'
import { getActiveNpcs } from '@/lib/game/npc-generator'

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

    if (player.currentLocation !== 'dark_alley') {
        return { error: 'You need to be at the Dark Alley to fight.' }
    }

    const npcs = getActiveNpcs(player.level)
    const enemy = npcs.find((e) => e.id === enemyId)
    if (!enemy) return { error: 'Musuh tidak valid atau sudah kadaluarsa (ganti waktu)' }

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
    finalPlayerHealth: number
) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const npcs = getActiveNpcs(player.level)
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
    } else {
        // Defeated → hospitalize
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
