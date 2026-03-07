import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import NpcContent from './npc-content'

export default async function NpcPage() {
    const player = await getPlayer()
    if (!player) redirect('/create')

    return <NpcContent player={player} />
}
