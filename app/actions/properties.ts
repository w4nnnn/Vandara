'use server'

import { db } from '@/lib/db'
import { players, playerProperties } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getPlayer } from './character'
import { PROPERTIES } from '@/lib/game/constants'

// Buy a property
export async function buyProperty(propertyId: string) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    if (player.isHospitalized) {
        return { error: 'You are in the hospital.' }
    }

    if (player.travelingTo) {
        return { error: 'You are traveling.' }
    }

    const propDef = PROPERTIES[propertyId]
    if (!propDef) return { error: 'Invalid property.' }

    if (player.currentLocation !== propDef.locationId) {
        return { error: 'You must be in the same location to buy this property.' }
    }

    if (Number(player.money) < propDef.cost) {
        return { error: 'Not enough money.' }
    }

    // Check if player already owns it
    const existing = await db.query.playerProperties.findFirst({
        where: and(
            eq(playerProperties.playerId, player.id),
            eq(playerProperties.propertyId, propertyId)
        )
    })

    if (existing) {
        return { error: 'You already own this property.' }
    }

    // Deduct money
    const updatedMoney = Number(player.money) - propDef.cost

    await db
        .update(players)
        .set({
            money: updatedMoney,
            updatedAt: new Date(),
        })
        .where(eq(players.id, player.id))

    // Give property
    await db
        .insert(playerProperties)
        .values({
            playerId: player.id,
            propertyId,
            lastCollectedAt: new Date(),
        })

    return {
        success: true,
        bought: propDef.label,
    }
}

// Collect income from a specific property
export async function collectIncome(playerPropertyId: number) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    if (player.isHospitalized) {
        return { error: 'You are in the hospital.' }
    }

    if (player.travelingTo) {
        return { error: 'You are traveling.' }
    }

    // Find the property
    const propRecord = await db.query.playerProperties.findFirst({
        where: and(
            eq(playerProperties.id, playerPropertyId),
            eq(playerProperties.playerId, player.id)
        )
    })

    if (!propRecord) return { error: 'You do not own this property.' }

    const propDef = PROPERTIES[propRecord.propertyId]
    if (!propDef) return { error: 'Property definition not found.' }

    // Calculate elapsed time
    const now = new Date()
    const lastCollected = new Date(propRecord.lastCollectedAt)
    const elapsedMs = now.getTime() - lastCollected.getTime()
    const elapsedHours = elapsedMs / (1000 * 60 * 60)

    if (elapsedHours < 0.1) { // Prevent micro-claiming abuse, min 6 mins
        return { error: 'Too soon to collect. Wait a bit longer.' }
    }

    // Calculate income
    const income = Math.floor(elapsedHours * propDef.incomePerHour)
    if (income <= 0) {
        return { error: 'No income generated yet.' }
    }

    // Add money
    const updatedMoney = Number(player.money) + income
    await db
        .update(players)
        .set({
            money: updatedMoney,
            updatedAt: new Date(),
        })
        .where(eq(players.id, player.id))

    // Update lastCollectedAt
    await db
        .update(playerProperties)
        .set({
            lastCollectedAt: now,
        })
        .where(eq(playerProperties.id, propRecord.id))

    return {
        success: true,
        income,
        label: propDef.label,
    }
}
