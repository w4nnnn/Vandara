'use server'

import { db } from '@/lib/db'
import { players, playerItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getPlayer } from './character'
import { CRAFTING_RECIPES, ITEMS } from '@/lib/game/constants'
import { trackQuestProgress } from './quests'
import { addReputation } from './reputation'
import { REP_GAINS, type LocationId } from '@/lib/game/constants'

export async function craftItem(recipeId: string) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId)
    if (!recipe) return { error: 'Recipe not found' }

    // Check level requirements
    if (player.level < recipe.levelRequired) return { error: `Butuh level ${recipe.levelRequired}` }
    if (player.scavengeLevel < recipe.scavengeLevelRequired) return { error: `Butuh scavenge level ${recipe.scavengeLevelRequired}` }

    // Check materials
    for (const input of recipe.inputs) {
        const item = await db.query.playerItems.findFirst({
            where: and(eq(playerItems.playerId, player.id), eq(playerItems.itemId, input.itemId)),
        })
        if (!item || item.quantity < input.quantity) {
            const def = ITEMS[input.itemId]
            return { error: `Bahan kurang: ${def?.label ?? input.itemId} (${item?.quantity ?? 0}/${input.quantity})` }
        }
    }

    // Consume materials
    for (const input of recipe.inputs) {
        const item = await db.query.playerItems.findFirst({
            where: and(eq(playerItems.playerId, player.id), eq(playerItems.itemId, input.itemId)),
        })
        if (!item) continue
        const newQty = item.quantity - input.quantity
        if (newQty <= 0) {
            await db.delete(playerItems).where(eq(playerItems.id, item.id))
        } else {
            await db.update(playerItems).set({ quantity: newQty }).where(eq(playerItems.id, item.id))
        }
    }

    // Give output
    const existingOutput = await db.query.playerItems.findFirst({
        where: and(eq(playerItems.playerId, player.id), eq(playerItems.itemId, recipe.output.itemId)),
    })
    if (existingOutput) {
        await db.update(playerItems).set({ quantity: existingOutput.quantity + recipe.output.quantity }).where(eq(playerItems.id, existingOutput.id))
    } else {
        await db.insert(playerItems).values({ playerId: player.id, itemId: recipe.output.itemId, quantity: recipe.output.quantity })
    }

    // Track quest progress
    await trackQuestProgress(player.id, 'craft', player.currentLocation as LocationId)

    // Add reputation
    await addReputation(player.id, player.currentLocation as LocationId, REP_GAINS.craft)

    return { success: true, outputItemId: recipe.output.itemId, outputQty: recipe.output.quantity }
}
