'use server'

import { db } from '@/lib/db'
import { players, playerQuests, playerItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getPlayer } from './character'
import { DAILY_QUESTS, DAILY_QUEST_COUNT, type QuestObjective, type LocationId } from '@/lib/game/constants'
import { addReputation } from './reputation'

// Get or assign daily quests for a player
export async function getDailyQuests() {
    const player = await getPlayer()
    if (!player) return []

    const existing = await db.query.playerQuests.findMany({
        where: eq(playerQuests.playerId, player.id),
    })

    // If no quests or quests are from a previous day, assign new ones
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const hasToday = existing.some(q => new Date(q.assignedAt) >= today)
    if (!hasToday) {
        // Delete old quests
        if (existing.length > 0) {
            for (const q of existing) {
                await db.delete(playerQuests).where(eq(playerQuests.id, q.id))
            }
        }
        // Assign random daily quests
        const shuffled = [...DAILY_QUESTS].sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, DAILY_QUEST_COUNT)

        for (const quest of selected) {
            await db.insert(playerQuests).values({
                playerId: player.id,
                questId: quest.id,
                progress: 0,
                completed: false,
                claimed: false,
            })
        }

        return db.query.playerQuests.findMany({
            where: eq(playerQuests.playerId, player.id),
        })
    }

    return existing
}

// Track quest progress (called from other actions)
export async function trackQuestProgress(playerId: number, objective: QuestObjective, locationId?: LocationId) {
    const quests = await db.query.playerQuests.findMany({
        where: and(eq(playerQuests.playerId, playerId), eq(playerQuests.completed, false)),
    })

    for (const pq of quests) {
        const def = DAILY_QUESTS.find(q => q.id === pq.questId)
        if (!def || def.objective !== objective) continue
        // Check location requirement
        if (def.locationId && def.locationId !== locationId) continue

        const newProgress = pq.progress + 1
        const completed = newProgress >= def.target

        await db.update(playerQuests).set({
            progress: newProgress,
            completed,
        }).where(eq(playerQuests.id, pq.id))
    }
}

// Claim reward for a completed quest
export async function claimQuestReward(questRowId: number) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const pq = await db.query.playerQuests.findFirst({
        where: and(eq(playerQuests.id, questRowId), eq(playerQuests.playerId, player.id)),
    })
    if (!pq) return { error: 'Quest not found' }
    if (!pq.completed) return { error: 'Quest not completed yet' }
    if (pq.claimed) return { error: 'Already claimed' }

    const def = DAILY_QUESTS.find(q => q.id === pq.questId)
    if (!def) return { error: 'Quest definition not found' }

    // Give rewards
    let moneyGain = def.rewards.money ?? 0
    let xpGain = def.rewards.xp ?? 0

    await db.update(players).set({
        money: player.money + moneyGain,
        experience: player.experience + xpGain,
        updatedAt: new Date(),
    }).where(eq(players.id, player.id))

    // Give item reward
    if (def.rewards.itemId) {
        const existing = await db.query.playerItems.findFirst({
            where: and(eq(playerItems.playerId, player.id), eq(playerItems.itemId, def.rewards.itemId)),
        })
        if (existing) {
            await db.update(playerItems).set({ quantity: existing.quantity + (def.rewards.itemQty ?? 1) }).where(eq(playerItems.id, existing.id))
        } else {
            await db.insert(playerItems).values({ playerId: player.id, itemId: def.rewards.itemId, quantity: def.rewards.itemQty ?? 1 })
        }
    }

    // Give reputation reward
    if (def.rewards.reputation) {
        await addReputation(player.id, def.rewards.reputation.locationId, def.rewards.reputation.amount)
    }

    // Mark as claimed
    await db.update(playerQuests).set({ claimed: true }).where(eq(playerQuests.id, pq.id))

    return { success: true, moneyGain, xpGain, itemId: def.rewards.itemId, itemQty: def.rewards.itemQty }
}
