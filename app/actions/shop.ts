'use server'

import { db } from '@/lib/db'
import { players, playerItems } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getPlayer } from './character'
import { ITEMS } from '@/lib/game/constants'

// Define what each shop sells
export const SHOP_INVENTORY: Record<string, string[]> = {
    city_center: ['energy_drink', 'small_potion', 'nerve_pill', 'happy_meal', 'bandages'],
    dark_alley: ['large_potion', 'protein_shake', 'medkit'], // Black Market
}

export async function buyShopItem(itemId: string, qty: number = 1) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    if (player.isHospitalized) {
        return { error: 'You are in the hospital.' }
    }

    if (player.travelingTo) {
        return { error: 'You are traveling.' }
    }

    const availableItems = SHOP_INVENTORY[player.currentLocation]
    if (!availableItems) {
        return { error: 'There is no shop here.' }
    }

    if (!availableItems.includes(itemId)) {
        return { error: 'This item is not sold here.' }
    }

    const itemDef = ITEMS[itemId]
    if (!itemDef) return { error: 'Invalid item' }

    if (qty < 1) return { error: 'Invalid quantity' }

    // In Dark Alley (Black Market), prices might be marked up by 50%
    const priceMultiplier = player.currentLocation === 'dark_alley' ? 1.5 : 1.0
    const itemPrice = Math.floor(itemDef.value * priceMultiplier)
    const totalCost = itemPrice * qty

    if (Number(player.money) < totalCost) {
        return { error: 'Not enough money' }
    }

    // Deduct money
    let updatedMoney = Number(player.money) - totalCost

    await db
        .update(players)
        .set({
            money: updatedMoney,
            updatedAt: new Date(),
        })
        .where(eq(players.id, player.id))

    // Give item
    const existing = await db.query.playerItems.findFirst({
        where: and(
            eq(playerItems.playerId, player.id),
            eq(playerItems.itemId, itemId),
        ),
    })

    if (existing) {
        await db
            .update(playerItems)
            .set({ quantity: sql`${playerItems.quantity} + ${qty}` })
            .where(eq(playerItems.id, existing.id))
    } else {
        await db
            .insert(playerItems)
            .values({
                playerId: player.id,
                itemId,
                quantity: qty,
            })
    }

    return {
        success: true,
        bought: itemDef.label,
        totalCost,
    }
}
