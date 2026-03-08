import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import { getInventory } from '@/app/actions/inventory'
import MarketplaceContent from './marketplace-content'

export const metadata = {
  title: 'Marketplace | RPG Game',
}

export default async function MarketplacePage() {
  const player = await getPlayer()
  if (!player) redirect('/create')
  if (player.isHospitalized) redirect('/hospital')
  if (player.travelingTo) redirect('/travel')

  const inv = await getInventory()
  const inventory = ('items' in inv && inv.items)
    ? inv.items.map(i => ({ itemId: i.itemId, quantity: i.quantity }))
    : []

  return (
    <MarketplaceContent
      player={{ id: player.id, money: player.money }}
      inventory={inventory}
    />
  )
}
