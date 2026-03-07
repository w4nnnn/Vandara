'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useTransition } from 'react'
import { dismissEncounterMessage } from '@/app/actions/character'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'
import {
  LayoutDashboardIcon,
  UsersIcon,
  DumbbellIcon,
  BackpackIcon,
  BriefcaseIcon,
  PlaneIcon,
  HeartPulseIcon,
  MapPinIcon,
  HeartIcon,
  BoltIcon,
  BrainIcon,
  SmileIcon,
  CoinsIcon,
  BuildingIcon,
  AlertTriangleIcon,
  HospitalIcon,
  SearchIcon,
  StoreIcon,
  ArrowRightLeftIcon,
  LanguagesIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  LOCATIONS,
  ACTIVITY_LOCATIONS,
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

const LOCATION_ICONS: Record<LocationId, LucideIcon> = {
  city_center: BuildingIcon,
  gym_district: DumbbellIcon,
  business_district: BriefcaseIcon,
  dark_alley: MapPinIcon,
  hospital: HospitalIcon,
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

const NAV_KEYS = [
  { key: 'nav.home', href: '/dashboard', icon: LayoutDashboardIcon, activity: null },
  { key: 'nav.travel', href: '/travel', icon: PlaneIcon, activity: null },
  { key: 'nav.scavenge', href: '/scavenge', icon: SearchIcon, activity: null },
  { key: 'nav.shop', href: '/shop', icon: StoreIcon, activity: null },
  { key: 'nav.properties', href: '/properties', icon: BuildingIcon, activity: null },
  { key: 'nav.npc', href: '/npc', icon: UsersIcon, activity: 'combat' as const },
  { key: 'nav.gym', href: '/gym', icon: DumbbellIcon, activity: 'gym' as const },
  { key: 'nav.jobs', href: '/jobs', icon: BriefcaseIcon, activity: 'jobs' as const },
  { key: 'nav.hospital', href: '/hospital', icon: HeartPulseIcon, activity: 'hospital' as const },
  { key: 'nav.inventory', href: '/inventory', icon: BackpackIcon, activity: null },
]

// ─── Compact HUD Stat Bar ────────────────────────────────────────

function HudStat({
  icon: Icon,
  current,
  max,
  color,
  label,
}: {
  icon: React.ElementType
  current: number
  max: number
  color: string
  label: string
}) {
  const pct = Math.max(0, Math.min(100, Math.round((current / max) * 100)))
  return (
    <div className="flex items-center gap-1.5 min-w-0" title={`${label}: ${current}/${max}`} aria-label={`${label}: ${current}/${max}`}>
      <Icon className={`size-3.5 shrink-0 ${color}`} />
      <div className="relative h-2 w-12 sm:w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear ${color.replace('text-', 'bg-')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-white/60 hidden sm:inline">
        {current}
      </span>
    </div>
  )
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

  function handleDismissEncounter() {
    setHideEncounter(true)
    startTransition(async () => {
      await dismissEncounterMessage()
      router.refresh()
    })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* ═══ TOP HUD BAR ═══ */}
      <header className="sticky top-0 z-50 border-b bg-zinc-900 text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-3 py-2">
          {/* Left: Location */}
          <Link
            href="/travel"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium hover:bg-white/10 transition-colors shrink-0"
          >
            {isTraveling ? (
              <div className="absolute flex items-center gap-1 -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary/20 px-3 py-0.5 text-[10px] sm:text-xs font-bold text-primary backdrop-blur-md">
                <PlaneIcon className="size-3" /> {Math.ceil(travelCountdown / 1000)}s
              </div>
            ) : (
              <span className="flex items-center gap-1.5">
                {currentLoc && (() => { const Icon = LOCATION_ICONS[currentLoc.id]; return <Icon className="size-3.5 text-muted-foreground" /> })()}
                {t(`loc.${currentLoc?.id}`) || t('unknown')}
              </span>
            )}
          </Link>

          {/* Center: Stat Bars */}
          <div className="flex items-center gap-2 sm:gap-3">
            <HudStat icon={HeartIcon} current={stats.health} max={player.maxHealth} color="text-red-500" label={t('health')} />
            <HudStat icon={BoltIcon} current={stats.energy} max={player.maxEnergy} color="text-green-500" label={t('energy')} />
            <HudStat icon={BrainIcon} current={stats.nerve} max={player.maxNerve} color="text-blue-500" label={t('nerve')} />
            <HudStat icon={SmileIcon} current={stats.happy} max={player.maxHappy} color="text-yellow-500" label={t('happy')} />
          </div>

          {/* Right: Money + Language + RTL toggle */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
              <CoinsIcon className="size-3.5" />
              <span className="tabular-nums">
                ${Number(player.money) >= 1000
                  ? `${(Number(player.money) / 1000).toFixed(1)}K`
                  : Number(player.money).toLocaleString()}
              </span>
            </div>
            <button
              aria-label={t('hud.language')}
              onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
              className="p-1 rounded hover:bg-white/10 text-[10px] font-bold uppercase"
              title={t('hud.language')}
            >
              {locale === 'id' ? 'EN' : 'ID'}
            </button>
            <button
              aria-label="Toggle RTL/LTR"
              onClick={toggleDir}
              className="p-1 rounded hover:bg-white/10"
              title={`${dir.toUpperCase()}`}
            >
              <ArrowRightLeftIcon className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Hospitalized banner */}
        {player.isHospitalized && (
          <div className="flex items-center justify-center gap-1.5 bg-red-900/80 text-center text-xs text-red-200 py-1 font-medium">
            <HospitalIcon className="size-3.5" /> {t('hud.hospitalized')}
          </div>
        )}
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="mx-auto w-full max-w-2xl flex-1 p-4 pb-20 space-y-4">
        {/* Random Encounter Banner */}
        {player.lastEncounterMsg && !hideEncounter && (
          <Alert className="border-primary/50 bg-primary/10">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>{t('hud.encounter')}</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-3">
              <p>{player.lastEncounterMsg}</p>
              <Button size="sm" onClick={handleDismissEncounter} disabled={isPending} className="w-fit">
                {isPending ? t('hud.dismissing') : t('hud.continue')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {children}
      </main>

      {/* ═══ BOTTOM NAV BAR ═══ */}
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-zinc-900/95 backdrop-blur-sm text-white safe-area-pb">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-1 py-1">
          {NAV_KEYS.map((item) => {
            const label = t(item.key)
            const isActive = pathname === item.href
            const requiredLoc = item.activity ? ACTIVITY_LOCATIONS[item.activity] : null
            const isLocked = requiredLoc
              ? player.currentLocation !== requiredLoc || !!player.travelingTo
              : !!player.travelingTo && item.activity !== null

            const handleNavClick = (e: React.MouseEvent) => {
              if (isLocked && item.activity) {
                e.preventDefault()
                const locLabel = t(`activityLoc.${item.activity}`)
                toast.warning(t('toast.notAvailable', { item: label }), {
                  description: t('toast.mustTravel', { loc: locLabel, item: label }),
                  action: {
                    label: t('toast.go'),
                    onClick: () => router.push('/travel'),
                  },
                })
              }
            }

            return (
              <Link
                key={item.href}
                href={isLocked ? '#' : item.href}
                onClick={handleNavClick}
                className={`flex flex-1 flex-col items-center justify-center gap-1 h-14 rounded-xl text-[10px] sm:text-xs transition-colors ${isActive
                  ? 'text-white bg-white/15'
                  : isLocked
                    ? 'text-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className="size-5" />
                <span className="truncate w-full text-center px-0.5">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
