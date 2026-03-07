'use server'

import { db } from '@/lib/db'
import { players, gymLogs } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getPlayer } from './character'
import { GYM_EXERCISES, type GymStat } from '@/lib/game/constants'

export async function trainGym(exerciseId: string) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  if (player.isHospitalized) {
    return { error: 'You are in the hospital and cannot train right now.' }
  }

  const exercise = GYM_EXERCISES.find((e) => e.id === exerciseId)
  if (!exercise) return { error: 'Invalid exercise' }

  if (player.energy < exercise.energyCost) {
    return { error: 'Not enough energy' }
  }

  const gain = exercise.baseGain

  const statColumn = exercise.stat as GymStat
  await db
    .update(players)
    .set({
      [statColumn]: sql`${players[statColumn]} + ${gain}`,
      energy: sql`${players.energy} - ${exercise.energyCost}`,
      updatedAt: new Date(),
    })
    .where(eq(players.id, player.id))

  await db.insert(gymLogs).values({
    playerId: player.id,
    stat: exercise.stat,
    gained: gain,
    energySpent: exercise.energyCost,
  })

  return {
    success: true,
    stat: exercise.stat,
    gained: gain,
    energySpent: exercise.energyCost,
  }
}
