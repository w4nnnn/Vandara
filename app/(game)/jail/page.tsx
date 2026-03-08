import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import JailContent from './jail-content'

export const metadata = {
  title: 'Penjara | RPG Game',
}

export default async function JailPage() {
  const player = await getPlayer()
  if (!player) redirect('/create')

  return (
    <JailContent
      player={{
        id: player.id,
        isJailed: player.isJailed,
        jailUntil: player.jailUntil,
        jailReason: player.jailReason,
        energy: player.energy,
      }}
    />
  )
}
