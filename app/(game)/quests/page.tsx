import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import { getDailyQuests } from '@/app/actions/quests'
import QuestsContent from './quests-content'

export default async function QuestsPage() {
    const player = await getPlayer()
    if (!player) redirect('/create')

    const quests = await getDailyQuests()

    return <QuestsContent player={player} quests={quests} />
}
