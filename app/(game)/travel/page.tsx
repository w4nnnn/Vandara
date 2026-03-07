import { getPlayer } from '@/app/actions/character'
import { redirect } from 'next/navigation'
import TravelContent from './travel-content'

export default async function TravelPage() {
    const player = await getPlayer()
    if (!player) redirect('/create')
    return <TravelContent player={player} />
}
