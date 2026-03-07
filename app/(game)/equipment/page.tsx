import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import EquipmentContent from './equipment-content'
import { db } from '@/lib/db'
import { playerItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function EquipmentPage() {
    const player = await getPlayer()
    if (!player) redirect('/create')

    const items = await db.query.playerItems.findMany({
        where: eq(playerItems.playerId, player.id),
    })

    return <EquipmentContent player={player} playerItems={items} />
}
