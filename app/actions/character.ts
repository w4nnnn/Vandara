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

  // Auto-clear hospital if timer expired
  const now = new Date()
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
    await db
      .update(players)
      .set({
        currentLocation,
        travelingTo: null,
        travelingUntil: null,
        updatedAt: now,
      })
      .where(eq(players.id, player.id))
  }

  // Apply stat regeneration based on elapsed time
  const regen = applyRegen({ ...player, updatedAt: isHospitalized ? now : player.updatedAt })
  if (regen.changed) {
    await db
      .update(players)
      .set({
        energy: regen.energy,
        nerve: regen.nerve,
        health: regen.health,
        happy: regen.happy,
        updatedAt: new Date(),
      })
      .where(eq(players.id, player.id))
  }

  const avatar = await db.query.playerAvatars.findFirst({
    where: eq(playerAvatars.playerId, playerId),
  })

  return {
    ...player,
    energy: regen.energy,
    nerve: regen.nerve,
    health: regen.health,
    happy: regen.happy,
    isHospitalized,
    hospitalUntil,
    currentLocation,
    travelingTo,
    travelingUntil,
    avatar,
  }
}
