import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import EducationContent from './education-content'

export default async function EducationPage() {
  const player = await getPlayer()
  if (!player) redirect('/create')

  return <EducationContent player={player} />
}
