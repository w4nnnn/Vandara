import { db } from '@/lib/db'
import { playerProperties } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getPlayer } from '@/app/actions/character'
import { redirect } from 'next/navigation'
import PropertiesContent from './properties-content'

export const metadata = {
    title: 'Real Estate | RPG Game',
}

export default async function PropertiesPage() {
    const player = await getPlayer()

    if (!player) redirect('/create')
    if (player.isHospitalized) redirect('/hospital')
    if (player.travelingTo) redirect('/travel')

    // Fetch owned properties
    const owned = await db.query.playerProperties.findMany({
        where: eq(playerProperties.playerId, player.id),
    })

    return <PropertiesContent
        player={{
            id: player.id,
            money: Number(player.money),
            currentLocation: player.currentLocation as string,
        }}
        ownedProperties={owned.map(p => ({
            id: p.id,
            propertyId: p.propertyId,
            lastCollectedAt: p.lastCollectedAt.toISOString(),
        }))}
    />
}
