'use server'

import { db } from '@/lib/db'
import { players, playerItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getPlayer } from './character'
import { ITEMS, type EquipmentSlot, EQUIPMENT_SLOTS, type CombatBonus } from '@/lib/game/constants'

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

    await db.update(players).set(updateData).where(eq(players.id, player.id))
    return { success: true, slot }
}

export function getEquipmentBonuses(player: {
    equippedWeapon?: string | null
    equippedArmor?: string | null
    equippedAccessory?: string | null
}): CombatBonus {
    const combined: CombatBonus = {}
    const slots = [player.equippedWeapon, player.equippedArmor, player.equippedAccessory]

    for (const itemId of slots) {
        if (!itemId) continue
        const def = ITEMS[itemId]
        if (!def?.combatBonus) continue
        for (const [key, val] of Object.entries(def.combatBonus)) {
            ; (combined as any)[key] = ((combined as any)[key] ?? 0) + (val as number)
        }
    }
    return combined
}
