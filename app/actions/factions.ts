'use server'

import { db } from '@/lib/db'
import { players, factions, factionWars } from '@/lib/db/schema'
import { eq, sql, and, ne } from 'drizzle-orm'
import { getPlayer } from './character'
import { FACTION_CREATE_COST, FACTION_MAX_MEMBERS } from '@/lib/game/constants'

export async function getFaction() {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  if (!player.factionId) return { faction: null, members: [] }

  const faction = await db.query.factions.findFirst({
    where: eq(factions.id, player.factionId),
  })
  if (!faction) return { faction: null, members: [] }

  const members = await db.query.players.findMany({
    where: eq(players.factionId, faction.id),
    columns: { id: true, name: true, level: true, strength: true, constitution: true },
  })

  return { faction: { ...faction, money: Number(faction.money) }, members }
}

export async function createFaction(name: string, tag: string) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }
  if (player.factionId) return { error: 'Kamu sudah punya faksi.' }

  if (!name || name.length < 3 || name.length > 30) return { error: 'Nama faksi harus 3-30 karakter.' }
  if (!tag || tag.length < 2 || tag.length > 5) return { error: 'Tag faksi harus 2-5 karakter.' }
  if (!/^[a-zA-Z0-9 ]+$/.test(name)) return { error: 'Nama hanya boleh huruf, angka, dan spasi.' }
  if (!/^[A-Z0-9]+$/i.test(tag)) return { error: 'Tag hanya boleh huruf dan angka.' }

  if (player.money < FACTION_CREATE_COST) return { error: `Butuh $${FACTION_CREATE_COST.toLocaleString()}.` }

  try {
    const [faction] = await db.insert(factions).values({
      name,
      tag: tag.toUpperCase(),
      leaderId: player.id,
    }).returning()

    await db.update(players).set({
      factionId: faction.id,
      money: sql`${players.money} - ${FACTION_CREATE_COST}`,
      updatedAt: new Date(),
    }).where(eq(players.id, player.id))

    return { success: true, factionId: faction.id }
  } catch (e: any) {
    if (e?.code === '23505') return { error: 'Nama atau tag faksi sudah dipakai.' }
    return { error: 'Gagal membuat faksi.' }
  }
}

export async function leaveFaction() {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }
  if (!player.factionId) return { error: 'Kamu tidak di faksi manapun.' }

  // Check if leader
  const faction = await db.query.factions.findFirst({
    where: eq(factions.id, player.factionId),
  })
  if (faction && faction.leaderId === player.id) {
    // Transfer leadership or disband
    const otherMembers = await db.query.players.findMany({
      where: and(eq(players.factionId, player.factionId), ne(players.id, player.id)),
      columns: { id: true },
      limit: 1,
    })
    if (otherMembers.length > 0) {
      await db.update(factions).set({ leaderId: otherMembers[0].id }).where(eq(factions.id, faction.id))
    } else {
      // Disband
      await db.delete(factions).where(eq(factions.id, faction.id))
    }
  }

  await db.update(players).set({
    factionId: null,
    updatedAt: new Date(),
  }).where(eq(players.id, player.id))

  return { success: true }
}

export async function listFactions() {
  const allFactions = await db.query.factions.findMany()
  const result = []
  for (const f of allFactions) {
    const memberCount = await db.query.players.findMany({
      where: eq(players.factionId, f.id),
      columns: { id: true },
    })
    result.push({
      ...f,
      money: Number(f.money),
      memberCount: memberCount.length,
    })
  }
  return result
}

export async function joinFaction(factionId: number) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }
  if (player.factionId) return { error: 'Kamu sudah punya faksi. Keluar dulu.' }

  const faction = await db.query.factions.findFirst({
    where: eq(factions.id, factionId),
  })
  if (!faction) return { error: 'Faksi tidak ditemukan.' }

  const memberCount = await db.query.players.findMany({
    where: eq(players.factionId, factionId),
    columns: { id: true },
  })
  if (memberCount.length >= FACTION_MAX_MEMBERS) return { error: 'Faksi sudah penuh.' }

  await db.update(players).set({
    factionId,
    updatedAt: new Date(),
  }).where(eq(players.id, player.id))

  return { success: true }
}

export async function depositFactionMoney(amount: number) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }
  if (!player.factionId) return { error: 'Kamu tidak di faksi manapun.' }
  if (amount <= 0) return { error: 'Jumlah tidak valid.' }
  if (player.money < amount) return { error: 'Uang tidak cukup.' }

  await db.update(players).set({
    money: sql`${players.money} - ${amount}`,
    updatedAt: new Date(),
  }).where(eq(players.id, player.id))

  await db.update(factions).set({
    money: sql`${factions.money} + ${amount}`,
  }).where(eq(factions.id, player.factionId))

  return { success: true }
}
