import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import FactionContent from './faction-content'

export default async function FactionPage() {
  const player = await getPlayer()
  if (!player) redirect('/create')

  return <FactionContent player={player} />
}
