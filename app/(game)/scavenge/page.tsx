import { getPlayer } from '@/app/actions/character'
import { redirect } from 'next/navigation'
import ScavengeContent from './scavenge-content'

export const metadata = {
    title: 'Scavenge | RPG Game',
}

export default async function ScavengePage() {
    const player = await getPlayer()

    // Base redirects
    if (!player) redirect('/create')
    if (player.isHospitalized) redirect('/hospital')
    if (player.travelingTo) redirect('/travel')

    return <ScavengeContent player={player} />
}
