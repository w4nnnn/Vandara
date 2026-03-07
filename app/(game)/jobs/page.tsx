import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import JobsContent from './jobs-content'

export default async function JobsPage() {
  const player = await getPlayer()
  if (!player) redirect('/create')

  return <JobsContent player={player} />
}
