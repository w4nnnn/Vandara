import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import CraftingContent from './crafting-content'
import { db } from '@/lib/db'
import { playerItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function CraftingPage() {
    const player = await getPlayer()
    if (!player) redirect('/create')

    const items = await db.query.playerItems.findMany({
        where: eq(playerItems.playerId, player.id),
    })

    return <CraftingContent player={player} playerItems={items} />
}
