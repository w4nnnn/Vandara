import { getPlayer } from '@/app/actions/character'
import { redirect } from 'next/navigation'
import ShopContent from './shop-content'

export const metadata = {
    title: 'Shop | RPG Game',
}

export default async function ShopPage() {
    const player = await getPlayer()

    // Base redirects
    if (!player) redirect('/create')
    if (player.isHospitalized) redirect('/hospital')
    if (player.travelingTo) redirect('/travel')

    return <ShopContent player={{
        id: player.id,
        name: player.name,
        money: player.money,
        currentLocation: player.currentLocation as string,
    }} />
}
