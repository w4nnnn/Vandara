'use server'

import { db } from '@/lib/db'
import { players, playerItems, marketListings } from '@/lib/db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import { getPlayer } from './character'
import {
  ITEMS, MARKET_LISTING_FEE_PERCENT, MARKET_MAX_LISTINGS,
  MARKET_MIN_PRICE, MARKET_MAX_PRICE,
} from '@/lib/game/constants'

export async function getMarketListings() {
  const listings = await db.query.marketListings.findMany({
    where: eq(marketListings.active, true),
    orderBy: desc(marketListings.createdAt),
  })

  // Attach seller names
  const result = []
  for (const listing of listings) {
    const seller = await db.query.players.findFirst({
      where: eq(players.id, listing.sellerId),
      columns: { name: true },
    })
    result.push({
      ...listing,
      price: Number(listing.price),
      sellerName: seller?.name ?? 'Unknown',
    })
  }
  return result
}

export async function getMyListings() {
  const player = await getPlayer()
  if (!player) return []

  const listings = await db.query.marketListings.findMany({
    where: and(eq(marketListings.sellerId, player.id), eq(marketListings.active, true)),
    orderBy: desc(marketListings.createdAt),
  })
  return listings.map(l => ({ ...l, price: Number(l.price) }))
}

export async function createListing(itemId: string, quantity: number, price: number) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  const itemDef = ITEMS[itemId]
  if (!itemDef) return { error: 'Item tidak valid.' }
  if (quantity < 1) return { error: 'Jumlah tidak valid.' }
  if (price < MARKET_MIN_PRICE || price > MARKET_MAX_PRICE) {
    return { error: `Harga harus antara $${MARKET_MIN_PRICE} - $${MARKET_MAX_PRICE.toLocaleString()}.` }
  }

  // Check active listings count
  const activeListings = await db.query.marketListings.findMany({
    where: and(eq(marketListings.sellerId, player.id), eq(marketListings.active, true)),
    columns: { id: true },
  })
  if (activeListings.length >= MARKET_MAX_LISTINGS) {
    return { error: `Maksimal ${MARKET_MAX_LISTINGS} listing aktif.` }
  }

  // Check player has the item
  const ownedItem = await db.query.playerItems.findFirst({
    where: and(eq(playerItems.playerId, player.id), eq(playerItems.itemId, itemId)),
  })
  if (!ownedItem || ownedItem.quantity < quantity) {
    return { error: 'Item tidak cukup.' }
  }

  // Listing fee
  const fee = Math.ceil(price * MARKET_LISTING_FEE_PERCENT / 100)
  if (player.money < fee) return { error: `Biaya listing: $${fee}. Uang tidak cukup.` }

  // Deduct item
  if (ownedItem.quantity === quantity) {
    await db.delete(playerItems).where(eq(playerItems.id, ownedItem.id))
  } else {
    await db.update(playerItems).set({
      quantity: sql`${playerItems.quantity} - ${quantity}`,
    }).where(eq(playerItems.id, ownedItem.id))
  }

  // Deduct fee
  await db.update(players).set({
    money: sql`${players.money} - ${fee}`,
    updatedAt: new Date(),
  }).where(eq(players.id, player.id))

  // Create listing
  await db.insert(marketListings).values({
    sellerId: player.id,
    itemId,
    quantity,
    price,
  })

  return { success: true, fee }
}

export async function buyListing(listingId: number) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  const listing = await db.query.marketListings.findFirst({
    where: and(eq(marketListings.id, listingId), eq(marketListings.active, true)),
  })
  if (!listing) return { error: 'Listing tidak ditemukan atau sudah terjual.' }
  if (listing.sellerId === player.id) return { error: 'Tidak bisa membeli listing sendiri.' }

  const price = Number(listing.price)
  if (player.money < price) return { error: 'Uang tidak cukup.' }

  // Deduct buyer money
  await db.update(players).set({
    money: sql`${players.money} - ${price}`,
    updatedAt: new Date(),
  }).where(eq(players.id, player.id))

  // Add money to seller
  await db.update(players).set({
    money: sql`${players.money} + ${price}`,
    updatedAt: new Date(),
  }).where(eq(players.id, listing.sellerId))

  // Give item to buyer
  const existing = await db.query.playerItems.findFirst({
    where: and(eq(playerItems.playerId, player.id), eq(playerItems.itemId, listing.itemId)),
  })
  if (existing) {
    await db.update(playerItems).set({
      quantity: sql`${playerItems.quantity} + ${listing.quantity}`,
    }).where(eq(playerItems.id, existing.id))
  } else {
    await db.insert(playerItems).values({
      playerId: player.id,
      itemId: listing.itemId,
      quantity: listing.quantity,
    })
  }

  // Mark listing as sold
  await db.update(marketListings).set({
    active: false,
    buyerId: player.id,
    soldAt: new Date(),
  }).where(eq(marketListings.id, listing.id))

  return { success: true, itemId: listing.itemId, quantity: listing.quantity }
}

export async function cancelListing(listingId: number) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  const listing = await db.query.marketListings.findFirst({
    where: and(
      eq(marketListings.id, listingId),
      eq(marketListings.sellerId, player.id),
      eq(marketListings.active, true),
    ),
  })
  if (!listing) return { error: 'Listing tidak ditemukan.' }

  // Return item to player
  const existing = await db.query.playerItems.findFirst({
    where: and(eq(playerItems.playerId, player.id), eq(playerItems.itemId, listing.itemId)),
  })
  if (existing) {
    await db.update(playerItems).set({
      quantity: sql`${playerItems.quantity} + ${listing.quantity}`,
    }).where(eq(playerItems.id, existing.id))
  } else {
    await db.insert(playerItems).values({
      playerId: player.id,
      itemId: listing.itemId,
      quantity: listing.quantity,
    })
  }

  // Deactivate listing
  await db.update(marketListings).set({ active: false }).where(eq(marketListings.id, listing.id))

  return { success: true }
}
