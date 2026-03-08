'use server'

import { db } from '@/lib/db'
import { players, playerAvatars } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AVATAR_OPTIONS, type AvatarOptionKey } from '@/lib/game/constants'
import { applyRegen } from '@/lib/game/regen'

const AVATAR_KEYS: AvatarOptionKey[] = [
  'topType', 'accessoriesType', 'hatColor', 'hairColor',
  'facialHairType', 'facialHairColor', 'clotheType', 'clotheColor',
  'graphicType', 'eyeType', 'eyebrowType', 'mouthType', 'skinColor',
]

function validateAvatarOption(key: AvatarOptionKey, value: string): boolean {
  const validValues = AVATAR_OPTIONS[key] as readonly string[]
  return validValues.includes(value)
}

export async function createCharacter(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()

  if (!name || name.length < 2 || name.length > 50) {
    return { error: 'Name must be between 2 and 50 characters' }
  }

  // Validate name contains only letters, numbers, spaces, hyphens
  if (!/^[a-zA-Z0-9 \-_]+$/.test(name)) {
    return { error: 'Name may only contain letters, numbers, spaces, and hyphens' }
  }

  // Build avatar data with validation
  const avatarData: Record<string, string> = {
    avatarStyle: 'Circle',
  }
  for (const key of AVATAR_KEYS) {
    const value = formData.get(key) as string
    if (value && validateAvatarOption(key, value)) {
      avatarData[key] = value
    }
  }

  try {
    const [player] = await db
      .insert(players)
      .values({ name })
      .returning()

    await db.insert(playerAvatars).values({
      playerId: player.id,
      avatarStyle: avatarData.avatarStyle ?? 'Circle',
      topType: avatarData.topType ?? 'LongHairStraight',
      accessoriesType: avatarData.accessoriesType ?? 'Blank',
      hatColor: avatarData.hatColor ?? 'Gray01',
      hairColor: avatarData.hairColor ?? 'BrownDark',
      facialHairType: avatarData.facialHairType ?? 'Blank',
      facialHairColor: avatarData.facialHairColor ?? 'BrownDark',
      clotheType: avatarData.clotheType ?? 'BlazerShirt',
      clotheColor: avatarData.clotheColor ?? 'Gray01',
      graphicType: avatarData.graphicType ?? 'Skull',
      eyeType: avatarData.eyeType ?? 'Default',
      eyebrowType: avatarData.eyebrowType ?? 'Default',
      mouthType: avatarData.mouthType ?? 'Default',
      skinColor: avatarData.skinColor ?? 'Light',
    })

    const cookieStore = await cookies()
    cookieStore.set('playerId', String(player.id), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
  } catch (e: any) {
    if (e?.code === '23505') {
      return { error: 'That name is already taken' }
    }
    return { error: 'Something went wrong. Please try again.' }
  }

  redirect('/dashboard')
}

export async function getPlayer() {
  const cookieStore = await cookies()
  const playerIdStr = cookieStore.get('playerId')?.value
  if (!playerIdStr) return null

  const playerId = parseInt(playerIdStr, 10)
  if (isNaN(playerId)) return null

  const player = await db.query.players.findFirst({
    where: eq(players.id, playerId),
  })
  if (!player) return null

  const now = new Date()

  // Auto-release jail if timer expired
  let isJailed = player.isJailed
  let jailUntil = player.jailUntil
  if (isJailed && jailUntil && now >= jailUntil) {
    isJailed = false
    jailUntil = null
    await db
      .update(players)
      .set({
        isJailed: false,
        jailUntil: null,
        jailReason: null,
        updatedAt: now,
      })
      .where(eq(players.id, player.id))
  }

  // Auto-clear hospital if timer expired
  let isHospitalized = player.isHospitalized
  let hospitalUntil = player.hospitalUntil
  if (isHospitalized && hospitalUntil && now >= hospitalUntil) {
    isHospitalized = false
    hospitalUntil = null
    await db
      .update(players)
      .set({
        isHospitalized: false,
        hospitalUntil: null,
        updatedAt: now,
      })
      .where(eq(players.id, player.id))
  }

  // Auto-complete travel if timer expired
  let currentLocation = player.currentLocation
  let travelingTo = player.travelingTo
  let travelingUntil = player.travelingUntil
  if (travelingTo && travelingUntil && now >= travelingUntil) {
    currentLocation = travelingTo
    travelingTo = null
    travelingUntil = null

    let lastEncounterMsg = player.lastEncounterMsg
    let updatedMoney = player.money
    let updatedHealth = player.health

    // 1% Chance for a random encounter upon completing travel
    if (Math.random() < 0.01) {
      const eventRoll = Math.random()
      if (eventRoll < 0.33) {
        const found = Math.floor(Math.random() * 401) + 100 // $100-$500
        updatedMoney += found
        lastEncounterMsg = `While traveling to ${currentLocation}, you found $${found} dropped on the street!`
      } else if (eventRoll < 0.66) {
        const lost = Math.floor(Math.random() * 201) + 50 // $50 - $250
        updatedMoney = Math.max(0, updatedMoney - lost)
        lastEncounterMsg = `A pickpocket bumped into you on your way to ${currentLocation}! You lost $${lost}.`
      } else {
        const damage = Math.floor(Math.random() * 11) + 5 // 5 - 15 dmg
        updatedHealth = Math.max(1, updatedHealth - damage)
        lastEncounterMsg = `You tripped over some debris on your way to ${currentLocation} and took ${damage} damage.`
      }
    }

    await db
      .update(players)
      .set({
        currentLocation,
        travelingTo: null,
        travelingUntil: null,
        lastEncounterMsg,
        money: updatedMoney,
        health: updatedHealth,
        updatedAt: now,
      })
      .where(eq(players.id, player.id))

    // Update local variables for return explicitly
    player.lastEncounterMsg = lastEncounterMsg
    player.money = updatedMoney
    player.health = updatedHealth
  }

  // Apply stat regeneration based on elapsed time
  const regen = applyRegen({ ...player, currentLocation, updatedAt: isHospitalized ? now : player.updatedAt })

  if (regen.changed) {
    let finalEncounterMsg = player.lastEncounterMsg
    let finalMoney = Number(player.money) - regen.moneyLost

    if (regen.moneyLost > 0) {
      finalEncounterMsg = `Someone pickpocketed you while you were idling in the Dark Alley! You lost $${regen.moneyLost}.`
    }

    await db
      .update(players)
      .set({
        energy: regen.energy,
        nerve: regen.nerve,
        health: regen.health,
        happy: regen.happy,
        money: finalMoney,
        lastEncounterMsg: finalEncounterMsg,
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id))

    player.money = finalMoney
    player.lastEncounterMsg = finalEncounterMsg
  }

  const avatar = await db.query.playerAvatars.findFirst({
    where: eq(playerAvatars.playerId, playerId),
  })

  return {
    ...player,
    money: Number(player.money),
    energy: regen.energy,
    nerve: regen.nerve,
    health: regen.health,
    happy: regen.happy,
    isHospitalized,
    hospitalUntil,
    isJailed,
    jailUntil,
    currentLocation,
    travelingTo,
    travelingUntil,
    avatar,
  }
}

export async function dismissEncounterMessage() {
  const player = await getPlayer()
  if (!player) return { error: 'Not logged in' }

  await db
    .update(players)
    .set({ lastEncounterMsg: null })
    .where(eq(players.id, player.id))

  return { success: true }
}
