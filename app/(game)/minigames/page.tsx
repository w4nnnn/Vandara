import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import MinigamesContent from './minigames-content'

export default async function MinigamesPage() {
    const player = await getPlayer()
    if (!player) redirect('/create')

    return <MinigamesContent player={player} />
}
