import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import CombatContent from './combat-content'

export default async function CombatPage() {
    const player = await getPlayer()
    if (!player) redirect('/create')

    return <CombatContent player={player} />
}
