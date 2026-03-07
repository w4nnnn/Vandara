import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import HospitalContent from './hospital-content'

export default async function HospitalPage() {
    const player = await getPlayer()
    if (!player) redirect('/create')

    return <HospitalContent player={player} />
}
