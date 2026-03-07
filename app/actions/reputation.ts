'use server'

import { db } from '@/lib/db'
import { playerReputation } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getPlayer } from './character'
import { type LocationId, getRepLevel, REPUTATION_LEVELS } from '@/lib/game/constants'

export async function getPlayerReputation() {
    const player = await getPlayer()
    if (!player) return []

    return db.query.playerReputation.findMany({
        where: eq(playerReputation.playerId, player.id),
    })
}

export async function addReputation(playerId: number, locationId: LocationId, amount: number) {
    const existing = await db.query.playerReputation.findFirst({
        where: and(eq(playerReputation.playerId, playerId), eq(playerReputation.locationId, locationId)),
    })

    if (existing) {
        await db.update(playerReputation).set({
            reputation: existing.reputation + amount,
        }).where(eq(playerReputation.id, existing.id))
    } else {
        await db.insert(playerReputation).values({
            playerId,
            locationId,
            reputation: amount,
        })
    }
}

export async function getRepBonuses(playerId: number, locationId: LocationId) {
    const row = await db.query.playerReputation.findFirst({
        where: and(eq(playerReputation.playerId, playerId), eq(playerReputation.locationId, locationId)),
    })
    const rep = row?.reputation ?? 0
    return getRepLevel(rep)
}
