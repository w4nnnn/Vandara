import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import DashboardContent from './dashboard-content'

export default async function DashboardPage() {
  const player = await getPlayer()
  if (!player) {
    redirect('/create')
  }

  return <DashboardContent player={player} />
}
