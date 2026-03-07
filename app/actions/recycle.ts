'use server'

import { db } from '@/lib/db'
import { playerItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getPlayer } from './character'
import { RECYCLE_RECIPES, ITEMS } from '@/lib/game/constants'

export async function recycle(recipeId: string) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const recipe = RECYCLE_RECIPES.find(r => r.id === recipeId)
    if (!recipe) return { error: 'Invalid recipe' }

    if (player.scavengeLevel < recipe.scavengeLevelRequired) {
        return { error: `Requires scavenge level ${recipe.scavengeLevelRequired}` }
    }

    // Check player has all inputs
    const inventory = await db.query.playerItems.findMany({
        where: eq(playerItems.playerId, player.id),
    })
    const invMap = new Map(inventory.map(i => [i.itemId, i]))

    for (const input of recipe.inputs) {
        const owned = invMap.get(input.itemId)
        if (!owned || owned.quantity < input.quantity) {
            const def = ITEMS[input.itemId]
            return { error: `Not enough ${def?.label ?? input.itemId}` }
        }
    }

    // Deduct inputs
    for (const input of recipe.inputs) {
        const owned = invMap.get(input.itemId)!
        const newQty = owned.quantity - input.quantity
        if (newQty <= 0) {
            await db.delete(playerItems).where(eq(playerItems.id, owned.id))
        } else {
            await db.update(playerItems).set({ quantity: newQty }).where(eq(playerItems.id, owned.id))
        }
    }

    // Give output
    const existingOutput = await db.query.playerItems.findFirst({
        where: and(eq(playerItems.playerId, player.id), eq(playerItems.itemId, recipe.output.itemId))
    })
    if (existingOutput) {
        await db.update(playerItems).set({ quantity: existingOutput.quantity + recipe.output.quantity }).where(eq(playerItems.id, existingOutput.id))
    } else {
        await db.insert(playerItems).values({
            playerId: player.id,
            itemId: recipe.output.itemId,
            quantity: recipe.output.quantity,
        })
    }

    return {
        success: true,
        outputItemId: recipe.output.itemId,
        outputQuantity: recipe.output.quantity,
    }
}
