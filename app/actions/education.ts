'use server'

import { db } from '@/lib/db'
import { players, playerEducation } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getPlayer } from './character'
import { COURSES } from '@/lib/game/constants'

export async function getEducationStatus() {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  const completed = await db.query.playerEducation.findMany({
    where: eq(playerEducation.playerId, player.id),
  })

  return {
    activeCourseId: player.activeCoursId,
    courseFinishAt: player.courseFinishAt,
    completedCourseIds: completed.map(c => c.courseId),
  }
}

export async function enrollCourse(courseId: string) {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  if (player.isHospitalized) return { error: 'Kamu sedang di rumah sakit!' }
  if (player.isJailed) return { error: 'Kamu sedang di penjara!' }

  const course = COURSES.find(c => c.id === courseId)
  if (!course) return { error: 'Kursus tidak ditemukan.' }

  if (player.level < course.levelRequired) {
    return { error: `Butuh level ${course.levelRequired}.` }
  }

  if (player.money < course.cost) {
    return { error: 'Uang tidak cukup.' }
  }

  if (player.activeCoursId) {
    return { error: 'Kamu sudah mengikuti kursus lain. Selesaikan dulu.' }
  }

  // Check if already completed
  const existing = await db.query.playerEducation.findFirst({
    where: and(
      eq(playerEducation.playerId, player.id),
      eq(playerEducation.courseId, courseId)
    ),
  })
  if (existing) return { error: 'Kamu sudah menyelesaikan kursus ini.' }

  const finishAt = new Date(Date.now() + course.durationMinutes * 60 * 1000)

  await db.update(players).set({
    money: sql`${players.money} - ${course.cost}`,
    activeCoursId: courseId,
    courseFinishAt: finishAt,
    updatedAt: new Date(),
  }).where(eq(players.id, player.id))

  return { success: true, finishAt }
}

export async function completeCourse() {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  if (!player.activeCoursId || !player.courseFinishAt) {
    return { error: 'Tidak ada kursus aktif.' }
  }

  if (new Date() < new Date(player.courseFinishAt)) {
    return { error: 'Kursus belum selesai.' }
  }

  const course = COURSES.find(c => c.id === player.activeCoursId)
  if (!course) return { error: 'Kursus tidak valid.' }

  // Apply rewards
  const updates: Record<string, any> = {
    activeCoursId: null,
    courseFinishAt: null,
    updatedAt: new Date(),
  }

  if (course.rewards.statBonus) {
    if (course.rewards.statBonus.strength) updates.strength = sql`${players.strength} + ${course.rewards.statBonus.strength}`
    if (course.rewards.statBonus.dexterity) updates.dexterity = sql`${players.dexterity} + ${course.rewards.statBonus.dexterity}`
    if (course.rewards.statBonus.constitution) updates.constitution = sql`${players.constitution} + ${course.rewards.statBonus.constitution}`
    if (course.rewards.statBonus.intelligence) updates.intelligence = sql`${players.intelligence} + ${course.rewards.statBonus.intelligence}`
    if (course.rewards.statBonus.wisdom) updates.wisdom = sql`${players.wisdom} + ${course.rewards.statBonus.wisdom}`
    if (course.rewards.statBonus.charisma) updates.charisma = sql`${players.charisma} + ${course.rewards.statBonus.charisma}`
    if (course.rewards.statBonus.luck) updates.luck = sql`${players.luck} + ${course.rewards.statBonus.luck}`
    if (course.rewards.statBonus.perception) updates.perception = sql`${players.perception} + ${course.rewards.statBonus.perception}`
  }
  if (course.rewards.maxEnergyBonus) updates.maxEnergy = sql`${players.maxEnergy} + ${course.rewards.maxEnergyBonus}`
  if (course.rewards.maxNerveBonus) updates.maxNerve = sql`${players.maxNerve} + ${course.rewards.maxNerveBonus}`
  if (course.rewards.maxHealthBonus) updates.maxHealth = sql`${players.maxHealth} + ${course.rewards.maxHealthBonus}`
  if (course.rewards.maxHappyBonus) updates.maxHappy = sql`${players.maxHappy} + ${course.rewards.maxHappyBonus}`

  await db.update(players).set(updates).where(eq(players.id, player.id))

  // Log completion
  await db.insert(playerEducation).values({
    playerId: player.id,
    courseId: course.id,
  })

  return { success: true, courseLabel: course.label, rewards: course.rewards }
}
