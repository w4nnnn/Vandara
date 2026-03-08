'use server'

import { db } from '@/lib/db'
import { players, playerItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getPlayer } from './character'
import { ITEMS, type EquipmentSlot } from '@/lib/game/constants'

export async function equipItem(itemId: string) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const def = ITEMS[itemId]
    if (!def || !def.equipSlot) return { error: 'Item tidak bisa diequip' }

    // Check ownership
    const owned = await db.query.playerItems.findFirst({
        where: and(eq(playerItems.playerId, player.id), eq(playerItems.itemId, itemId)),
    })
    if (!owned || owned.quantity < 1) return { error: 'Kamu tidak punya item ini' }

    const slot = def.equipSlot
    const updateData: Record<string, any> = { updatedAt: new Date() }

    if (slot === 'weapon') updateData.equippedWeapon = itemId
    else if (slot === 'armor') updateData.equippedArmor = itemId
    else if (slot === 'accessory') updateData.equippedAccessory = itemId
    else if (slot === 'tool') updateData.equippedTool = itemId

    await db.update(players).set(updateData).where(eq(players.id, player.id))
    return { success: true, slot, itemId }
}

export async function unequipItem(slot: EquipmentSlot) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const updateData: Record<string, any> = { updatedAt: new Date() }

    if (slot === 'weapon') updateData.equippedWeapon = null
    else if (slot === 'armor') updateData.equippedArmor = null
    else if (slot === 'accessory') updateData.equippedAccessory = null
    else if (slot === 'tool') updateData.equippedTool = null

    await db.update(players).set(updateData).where(eq(players.id, player.id))
    return { success: true, slot }
}
