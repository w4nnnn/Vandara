import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import SkillsContent from './skills-content'

export default async function SkillsPage() {
    const player = await getPlayer()
    if (!player) redirect('/create')

    return <SkillsContent player={player} />
}
