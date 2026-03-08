'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useTransition } from 'react'
import { dismissEncounterMessage } from '@/app/actions/character'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'
import {
  LayoutDashboardIcon,
  BackpackIcon,
  DumbbellIcon,
  BriefcaseIcon,
  HeartPulseIcon,
  BuildingIcon,
  SearchIcon,
  StoreIcon,
  UsersIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  LOCATIONS,
  FACILITY_ROUTES,
  ENERGY_REGEN_RATE,
  ENERGY_REGEN_INTERVAL_MS,
  NERVE_REGEN_RATE,
  NERVE_REGEN_INTERVAL_MS,
  HEALTH_REGEN_RATE,
  HEALTH_REGEN_INTERVAL_MS,
  HAPPY_REGEN_RATE,
  HAPPY_REGEN_INTERVAL_MS,
  type LocationId,
} from '@/lib/game/constants'
import { TopHud } from '@/components/game/top-hud'
import { LocationNav } from '@/components/game/location-nav'
import { BottomNav } from '@/components/game/bottom-nav'
import { EncounterAlert } from '@/components/game/encounter-alert'

// Icon resolver for facility routes
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard: LayoutDashboardIcon,
  Backpack: BackpackIcon,
  Search: SearchIcon,
  Store: StoreIcon,
  Building: BuildingIcon,
  Users: UsersIcon,
  Dumbbell: DumbbellIcon,
  Briefcase: BriefcaseIcon,
  HeartPulse: HeartPulseIcon,
}

type Player = {
  id: number
  name: string
  level: number
  money: number | bigint
  energy: number
  maxEnergy: number
  nerve: number
  maxNerve: number
  health: number
  maxHealth: number
  happy: number
  maxHappy: number
  currentLocation: string
  travelingTo: string | null
  travelingUntil: Date | null
  lastEncounterMsg: string | null
  updatedAt: Date
  isHospitalized: boolean
  avatar?: Record<string, any> | null
}

// ─── Main Layout ─────────────────────────────────────────────────

export default function GameLayoutClient({
  player,
  children,
}: {
  player: Player
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [hideEncounter, setHideEncounter] = useState(false)
  const { t, locale, setLocale, dir, toggleDir } = useTranslation()

  // Client-side regen simulation for HUD
  const computeStats = useCallback(() => {
    const elapsed = Date.now() - new Date(player.updatedAt).getTime()
    const calc = (base: number, max: number, rate: number, interval: number) => {
      if (base >= max) return max
      const ticks = Math.floor(elapsed / interval)
      return Math.min(base + ticks * rate, max)
    }
    return {
      health: calc(player.health, player.maxHealth, HEALTH_REGEN_RATE, HEALTH_REGEN_INTERVAL_MS),
      energy: calc(player.energy, player.maxEnergy, ENERGY_REGEN_RATE, ENERGY_REGEN_INTERVAL_MS),
      nerve: calc(player.nerve, player.maxNerve, NERVE_REGEN_RATE, NERVE_REGEN_INTERVAL_MS),
      happy: calc(player.happy, player.maxHappy, HAPPY_REGEN_RATE, HAPPY_REGEN_INTERVAL_MS),
    }
  }, [player])

  const [stats, setStats] = useState(computeStats)

  useEffect(() => {
    setStats(computeStats())
    const interval = setInterval(() => setStats(computeStats()), 1000)
    return () => clearInterval(interval)
  }, [computeStats])

  // Travel countdown
  const [travelCountdown, setTravelCountdown] = useState(0)
  const isTraveling = !!player.travelingTo && !!player.travelingUntil

  useEffect(() => {
    if (!isTraveling || !player.travelingUntil) return
    const target = new Date(player.travelingUntil).getTime()
    const tick = () => setTravelCountdown(Math.max(0, target - Date.now()))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isTraveling, player.travelingUntil])

  const currentLoc = LOCATIONS[player.currentLocation as LocationId]

  // Get facilities available at current location
  const facilities = (currentLoc?.facilities ?? [])
    .map(name => {
      const route = FACILITY_ROUTES[name]
      if (!route) return null
      const Icon = ICON_MAP[route.iconKey]
      if (!Icon) return null
      return { name, href: route.href, Icon, label: t(`facility.${name}`) }
    })
    .filter(Boolean) as { name: string; href: string; Icon: LucideIcon; label: string }[]

  function handleDismissEncounter() {
    setHideEncounter(true)
    startTransition(async () => {
      await dismissEncounterMessage()
      router.refresh()
    })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <TopHud
        isTraveling={isTraveling}
        travelCountdown={travelCountdown}
        currentLoc={currentLoc}
        stats={stats}
        maxStats={{
          health: player.maxHealth,
          energy: player.maxEnergy,
          nerve: player.maxNerve,
          happy: player.maxHappy,
        }}
        money={player.money}
        isHospitalized={player.isHospitalized}
        locale={locale}
        setLocale={setLocale}
        dir={dir}
        toggleDir={toggleDir}
        t={t}
      />

      <LocationNav
        isTraveling={isTraveling}
        travelCountdown={travelCountdown}
        travelingTo={player.travelingTo}
        facilities={facilities}
        pathname={pathname}
        t={t}
      />

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="mx-auto w-full max-w-2xl flex-1 p-4 pb-20 space-y-4">
        {player.lastEncounterMsg && !hideEncounter && (
          <EncounterAlert
            message={player.lastEncounterMsg}
            onDismiss={handleDismissEncounter}
            isPending={isPending}
            t={t}
          />
        )}

        {children}
      </main>

      <BottomNav pathname={pathname} t={t} />
    </div>
  )
}
