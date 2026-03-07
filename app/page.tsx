import { redirect } from 'next/navigation'
import { getPlayer } from '@/app/actions/character'

export default async function Home() {
  const player = await getPlayer()
  if (player) {
    redirect('/dashboard')
  }
  redirect('/create')
}
