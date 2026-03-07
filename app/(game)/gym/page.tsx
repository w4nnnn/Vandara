import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import GymContent from './gym-content'

export default async function GymPage() {
  const player = await getPlayer()
  if (!player) redirect('/create')

  return <GymContent player={player} />
}
