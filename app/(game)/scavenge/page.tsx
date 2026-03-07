import { getPlayer } from '@/app/actions/character'
import { redirect } from 'next/navigation'
import ScavengeContent from './scavenge-content'
import { getScavengeLogs } from '@/app/actions/scavenge'
import { db } from '@/lib/db'
import { playerItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const metadata = {
    title: 'Memulung | RPG Game',
}

export default async function ScavengePage() {
    const player = await getPlayer()

    // Base redirects
    if (!player) redirect('/create')
    if (player.isHospitalized) redirect('/hospital')
    if (player.travelingTo) redirect('/travel')

    const [logs, items] = await Promise.all([
        getScavengeLogs(),
        db.query.playerItems.findMany({
            where: eq(playerItems.playerId, player.id),
        }),
    ])

    return <ScavengeContent player={player} logs={logs} playerItems={items} />
}
