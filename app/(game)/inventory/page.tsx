import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import { getInventory } from '@/app/actions/inventory'
import InventoryContent from './inventory-content'

export default async function InventoryPage() {
  const player = await getPlayer()
  if (!player) redirect('/create')

  const inventoryResult = await getInventory()
  const items = ('items' in inventoryResult && inventoryResult.items) ? inventoryResult.items : []

  return <InventoryContent player={player} items={items} />
}
