'use server'

import { db } from '@/lib/db'
import { players } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getPlayer } from './character'
import { LOCATIONS, TRAVEL_TIMES, type LocationId } from '@/lib/game/constants'

export async function startTravel(destinationId: string) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    if (player.isHospitalized) {
        return { error: 'You are in the hospital and cannot travel.' }
    }

    if (player.travelingTo) {
        return { error: 'You are already traveling.' }
    }

    const destination = LOCATIONS[destinationId as LocationId]
    if (!destination) return { error: 'Invalid destination.' }

    if (player.currentLocation === destinationId) {
        return { error: 'You are already at this location.' }
    }

    const travelSeconds = TRAVEL_TIMES[player.currentLocation as LocationId]?.[destinationId as LocationId]
    if (travelSeconds === undefined || travelSeconds <= 0) {
        return { error: 'Cannot travel to this location.' }
    }

    const travelingUntil = new Date(Date.now() + travelSeconds * 1000)

    await db
        .update(players)
        .set({
            travelingTo: destinationId,
            travelingUntil,
            updatedAt: new Date(),
        })
        .where(eq(players.id, player.id))

    return {
        success: true,
        destination: destination.label,
        travelSeconds,
        travelingUntil,
    }
}
