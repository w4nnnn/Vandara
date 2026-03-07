'use server'

import { db } from '@/lib/db'
import { players, playerItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getPlayer } from './character'
import type { LocationId } from '@/lib/game/constants'

// Cost to scavenge
const SCAVENGE_ENERGY_COST = 5

type LootResult = {
    itemId: string
    quantity: number
    label: string
} | {
    money: number
    label: string
}

// Loot tables by location
// Returns either money or an item
function generateLoot(locationId: LocationId): LootResult {
    const roll = Math.random()

    switch (locationId) {
        case 'city_center':
            // High chance to find small money
            if (roll < 0.70) return { money: Math.floor(Math.random() * 20) + 5, label: 'Loose Change' }
            // Small chance to find a basic energy drink
            return { itemId: 'energy_drink', quantity: 1, label: 'Energy Drink' }

        case 'gym_district':
            // Medium chance to find protein shake
            if (roll < 0.40) return { itemId: 'protein_shake', quantity: 1, label: 'Protein Shake' }
            // Otherwise sweaty money
            return { money: Math.floor(Math.random() * 15) + 5, label: 'Dropped Cash' }

        case 'business_district':
            // High chance to find nothing or tiny money, but small chance for expensive item
            if (roll < 0.10) return { itemId: 'expensive_watch', quantity: 1, label: 'Expensive Watch' }
            if (roll < 0.30) return { itemId: 'briefcase', quantity: 1, label: 'Briefcase' }
            return { money: Math.floor(Math.random() * 50) + 10, label: 'Wallet' }

        case 'dark_alley':
            // Weapons/Scrap
            if (roll < 0.30) return { itemId: 'scrap_metal', quantity: Math.floor(Math.random() * 3) + 1, label: 'Scrap Metal' }
            if (roll < 0.40) return { itemId: 'rusty_shiv', quantity: 1, label: 'Rusty Shiv' }
            return { money: Math.floor(Math.random() * 30) + 10, label: 'Stashed Cash' }

        case 'hospital':
            // Meds
            if (roll < 0.40) return { itemId: 'bandages', quantity: 1, label: 'Bandages' }
            if (roll < 0.10) return { itemId: 'medkit', quantity: 1, label: 'Medkit' }
            return { money: Math.floor(Math.random() * 20) + 5, label: 'Lost Wallet' }

        default:
            return { money: 5, label: 'Coin' }
    }
}

export async function scavenge() {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    if (player.isHospitalized) {
        return { error: 'You cannot scavenge while hospitalized.' }
    }

    if (player.travelingTo) {
        return { error: 'You are traveling.' }
    }

    if (player.energy < SCAVENGE_ENERGY_COST) {
        return { error: `Not enough energy. Need ${SCAVENGE_ENERGY_COST}` }
    }

    const loot = generateLoot(player.currentLocation as LocationId)

    // Deduct energy
    let updatedEnergy = player.energy - SCAVENGE_ENERGY_COST
    let updatedMoney = player.money

    if ('money' in loot) {
        updatedMoney += loot.money
        await db
            .update(players)
            .set({
                energy: updatedEnergy,
                money: updatedMoney,
                updatedAt: new Date(),
            })
            .where(eq(players.id, player.id))
    } else {
        // Update energy
        await db
            .update(players)
            .set({
                energy: updatedEnergy,
                updatedAt: new Date(),
            })
            .where(eq(players.id, player.id))

        // Give item
        const existingItem = await db.query.playerItems.findFirst({
            where: and(
                eq(playerItems.playerId, player.id),
                eq(playerItems.itemId, loot.itemId)
            )
        })

        if (existingItem) {
            await db
                .update(playerItems)
                .set({ quantity: existingItem.quantity + loot.quantity })
                .where(eq(playerItems.id, existingItem.id))
        } else {
            await db
                .insert(playerItems)
                .values({
                    playerId: player.id,
                    itemId: loot.itemId,
                    quantity: loot.quantity,
                })
        }
    }

    return { success: true, loot }
}
