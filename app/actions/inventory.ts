'use server'

import { db } from '@/lib/db'
import { players, playerItems } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getPlayer } from './character'
import { ITEMS } from '@/lib/game/constants'

export async function getInventory() {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' as const }

  const items = await db.query.playerItems.findMany({
    where: eq(playerItems.playerId, player.id),
  })

  return { items }
}

export async function useItem(itemId: string) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  const itemDef = ITEMS[itemId]
  if (!itemDef) return { error: 'Invalid item' }
  if (!itemDef.effect) return { error: 'This item cannot be used' }

  // Check player owns the item
  const owned = await db.query.playerItems.findFirst({
    where: and(
      eq(playerItems.playerId, player.id),
      eq(playerItems.itemId, itemId),
    ),
  })
  if (!owned || owned.quantity < 1) return { error: 'You don\'t have this item' }

  // Apply effect
  const { stat, amount } = itemDef.effect
  if (stat && amount) {
    const maxStatKey = `max${stat.charAt(0).toUpperCase() + stat.slice(1)}` as
      'maxEnergy' | 'maxNerve' | 'maxHealth' | 'maxHappy'
    const maxVal = player[maxStatKey]
    const currentVal = player[stat]
    const newVal = Math.min(currentVal + amount, maxVal)

    await db
      .update(players)
      .set({
        [stat]: newVal,
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id))
  }

  // Decrease quantity (or remove if 0)
  if (owned.quantity <= 1) {
    await db
      .delete(playerItems)
      .where(eq(playerItems.id, owned.id))
  } else {
    await db
      .update(playerItems)
      .set({ quantity: sql`${playerItems.quantity} - 1` })
      .where(eq(playerItems.id, owned.id))
  }

  return {
    success: true,
    used: itemDef.label,
    effect: itemDef.effect,
  }
}

export async function sellItem(itemId: string, qty: number = 1) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  const itemDef = ITEMS[itemId]
  if (!itemDef) return { error: 'Invalid item' }

  if (qty < 1) return { error: 'Invalid quantity' }

  const owned = await db.query.playerItems.findFirst({
    where: and(
      eq(playerItems.playerId, player.id),
      eq(playerItems.itemId, itemId),
    ),
  })
  if (!owned || owned.quantity < qty) return { error: 'Not enough items' }

  const totalValue = Math.floor(itemDef.value * 0.5) * qty // sell at 50% value

  await db
    .update(players)
    .set({
      money: sql`${players.money} + ${totalValue}`,
      updatedAt: new Date(),
    })
    .where(eq(players.id, player.id))

  if (owned.quantity <= qty) {
    await db.delete(playerItems).where(eq(playerItems.id, owned.id))
  } else {
    await db
      .update(playerItems)
      .set({ quantity: sql`${playerItems.quantity} - ${qty}` })
      .where(eq(playerItems.id, owned.id))
  }

  return { success: true, moneyEarned: totalValue }
}

export async function buyItem(itemId: string, qty: number = 1) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  const itemDef = ITEMS[itemId]
  if (!itemDef) return { error: 'Invalid item' }
  if (itemDef.category === 'material') return { error: 'Cannot buy materials' }

  if (qty < 1) return { error: 'Invalid quantity' }

  const totalCost = itemDef.value * qty
  if (Number(player.money) < totalCost) return { error: 'Not enough money' }

  // Deduct money
  await db
    .update(players)
    .set({
      money: sql`${players.money} - ${totalCost}`,
      updatedAt: new Date(),
    })
    .where(eq(players.id, player.id))

  // Add to inventory (upsert)
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
    await db.insert(playerItems).values({
      playerId: player.id,
      itemId,
      quantity: qty,
    })
  }

  return { success: true, totalCost }
}
