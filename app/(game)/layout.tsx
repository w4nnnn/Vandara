import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'
import GameLayoutClient from './layout-client'

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const player = await getPlayer()
  if (!player) {
    redirect('/create')
  }

  return (
    <GameLayoutClient player={player}>
      {children}
    </GameLayoutClient>
  )
}
