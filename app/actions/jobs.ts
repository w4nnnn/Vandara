'use server'

import { db } from '@/lib/db'
import { players, jobLogs } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getPlayer } from './character'
import { JOBS, xpForLevel, REP_GAINS, SKILL_POINTS_PER_LEVEL, type LocationId } from '@/lib/game/constants'
import { trackQuestProgress } from './quests'
import { addReputation } from './reputation'

export async function applyForJob(jobId: string) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  const job = JOBS.find((j) => j.id === jobId)
  if (!job) return { error: 'Invalid job' }

  if (player.level < job.levelRequired) {
    return { error: `You need level ${job.levelRequired} for this job` }
  }

  await db
    .update(players)
    .set({ jobId: job.id, updatedAt: new Date() })
    .where(eq(players.id, player.id))

  return { success: true, jobId: job.id }
}

export async function quitJob() {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  if (!player.jobId) return { error: 'You don\'t have a job' }

  await db
    .update(players)
    .set({ jobId: null, updatedAt: new Date() })
    .where(eq(players.id, player.id))

  return { success: true }
}

export async function work() {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  if (player.isHospitalized) {
    return { error: 'You are in the hospital and cannot work right now.' }
  }

  if (player.currentLocation !== 'business_district') {
    return { error: 'You need to be at the Business District to work.' }
  }

  if (!player.jobId) return { error: 'You don\'t have a job' }

  const job = JOBS.find((j) => j.id === player.jobId)
  if (!job) return { error: 'Invalid job' }

  if (player.nerve < job.nerveCost) {
    return { error: 'Not enough nerve' }
  }

  // Calculate new XP/level
  const newXP = player.experience + job.xp
  let newLevel = player.level
  while (xpForLevel(newLevel + 1) <= newXP) {
    newLevel++
  }

  await db
    .update(players)
    .set({
      money: sql`${players.money} + ${job.pay}`,
      experience: newXP,
      level: newLevel,
      nerve: sql`${players.nerve} - ${job.nerveCost}`,
      updatedAt: new Date(),
    })
    .where(eq(players.id, player.id))

  await db.insert(jobLogs).values({
    playerId: player.id,
    jobId: job.id,
    moneyEarned: job.pay,
    xpEarned: job.xp,
  })

  const leveledUp = newLevel > player.level

  // Award skill points on level up
  if (leveledUp) {
    const levelsGained = newLevel - player.level
    await db.update(players).set({
      skillPoints: sql`${players.skillPoints} + ${levelsGained * SKILL_POINTS_PER_LEVEL}`,
    }).where(eq(players.id, player.id))
  }

  // Quest & reputation tracking
  await trackQuestProgress(player.id, 'job_work', player.currentLocation as LocationId)
  await addReputation(player.id, player.currentLocation as LocationId, REP_GAINS.job_work)

  return {
    success: true,
    moneyEarned: job.pay,
    xpEarned: job.xp,
    leveledUp,
    newLevel,
  }
}
