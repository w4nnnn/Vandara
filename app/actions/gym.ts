'use server'

import { db } from '@/lib/db'
import { players, gymLogs } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getPlayer } from './character'
import { GYM_EXERCISES, REP_GAINS, type GymStat, type LocationId } from '@/lib/game/constants'
import { trackQuestProgress } from './quests'
import { addReputation } from './reputation'

export async function trainGym(exerciseId: string) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  if (player.isHospitalized) {
    return { error: 'You are in the hospital and cannot train right now.' }
  }

  if (player.currentLocation !== 'gym_district') {
    return { error: 'You need to be at the Gym District to train.' }
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

  // Quest & reputation tracking
  await trackQuestProgress(player.id, 'gym_train', player.currentLocation as LocationId)
  await addReputation(player.id, player.currentLocation as LocationId, REP_GAINS.gym_train)

  return {
    success: true,
    stat: exercise.stat,
    gained: gain,
    energySpent: exercise.energyCost,
  }
}
