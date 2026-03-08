'use server'

import { db } from '@/lib/db'
import { players, jailLogs } from '@/lib/db/schema'
import { eq, sql, desc } from 'drizzle-orm'
import { getPlayer } from './character'
import { JAIL_ACTIVITIES, JAIL_DURATIONS, type JailCrime } from '@/lib/game/constants'

/**
 * Put a player in jail — called by combat/pickpocket failures
 */
export async function jailPlayer(playerId: number, crime: JailCrime) {
  const duration = JAIL_DURATIONS[crime] ?? 120
  const jailUntil = new Date(Date.now() + duration * 1000)

  await db
    .update(players)
    .set({
      isJailed: true,
      jailUntil,
      jailReason: crime,
      updatedAt: new Date(),
    })
    .where(eq(players.id, playerId))

  await db.insert(jailLogs).values({
    playerId,
    reason: crime,
    duration,
  })

  return { success: true, jailUntil, duration }
}

/**
 * Get jail status for the current player
 */
export async function getJailStatus() {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  const logs = await db.query.jailLogs.findMany({
    where: eq(jailLogs.playerId, player.id),
    orderBy: [desc(jailLogs.createdAt)],
    limit: 10,
  })

  return {
    isJailed: player.isJailed,
    jailUntil: player.jailUntil,
    jailReason: player.jailReason,
    energy: player.energy,
    logs,
  }
}

/**
 * Perform a jail activity to reduce time or attempt escape
 */
export async function performJailActivity(activityId: string) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }
  if (!player.isJailed || !player.jailUntil) return { error: 'Kamu tidak di penjara.' }

  const activity = JAIL_ACTIVITIES.find(a => a.id === activityId)
  if (!activity) return { error: 'Aktivitas tidak valid.' }

  if (player.energy < activity.energyCost) {
    return { error: 'Energi tidak cukup.' }
  }

  const now = Date.now()
  const success = Math.random() < activity.chance

  if (activity.id === 'escape_attempt') {
    if (success) {
      // Successful escape — free immediately
      await db
        .update(players)
        .set({
          isJailed: false,
          jailUntil: null,
          jailReason: null,
          energy: sql`${players.energy} - ${activity.energyCost}`,
          updatedAt: new Date(),
        })
        .where(eq(players.id, player.id))

      return { success: true, freed: true, message: 'Kamu berhasil kabur dari penjara!' }
    } else {
      // Failed escape — add extra time
      const extraSeconds = 120
      const newJailUntil = new Date(player.jailUntil.getTime() + extraSeconds * 1000)
      await db
        .update(players)
        .set({
          jailUntil: newJailUntil,
          energy: sql`${players.energy} - ${activity.energyCost}`,
          updatedAt: new Date(),
        })
        .where(eq(players.id, player.id))

      return {
        success: false,
        freed: false,
        message: 'Gagal kabur! Hukumanmu ditambah 2 menit.',
        newJailUntil,
      }
    }
  }

  // Regular activity — reduce time
  if (success) {
    const reduced = activity.reductionSeconds
    const newJailUntil = new Date(Math.max(now, player.jailUntil.getTime() - reduced * 1000))

    const updates: Record<string, unknown> = {
      energy: sql`${players.energy} - ${activity.energyCost}`,
      jailUntil: newJailUntil,
      updatedAt: new Date(),
    }

    // Check if time is now past
    if (newJailUntil.getTime() <= now) {
      updates.isJailed = false
      updates.jailUntil = null
      updates.jailReason = null
    }

    await db.update(players).set(updates).where(eq(players.id, player.id))

    // Update reducedBy in the latest jail log
    await db
      .update(jailLogs)
      .set({
        reducedBy: sql`${jailLogs.reducedBy} + ${reduced}`,
      })
      .where(eq(jailLogs.playerId, player.id))

    const freed = newJailUntil.getTime() <= now

    return {
      success: true,
      freed,
      message: freed
        ? 'Hukumanmu telah berakhir, kamu bebas!'
        : `Berhasil! Waktu dikurangi ${reduced} detik.`,
      newJailUntil: freed ? null : newJailUntil,
    }
  } else {
    // Failed activity — just consume energy
    await db
      .update(players)
      .set({
        energy: sql`${players.energy} - ${activity.energyCost}`,
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id))

    return {
      success: false,
      freed: false,
      message: 'Gagal! Energi terbuang sia-sia.',
    }
  }
}
