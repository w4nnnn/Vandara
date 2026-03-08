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
  ScrollTextIcon,
  HammerIcon,
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

const LOCATION_ICONS: Record<LocationId, LucideIcon> = {
  city_center: BuildingIcon,
  gym_district: DumbbellIcon,
  business_district: BriefcaseIcon,
  dark_alley: MapPinIcon,
  hospital: HospitalIcon,
}

// Bottom nav — only personal/global items (5 max)
const BOTTOM_NAV = [
  { key: 'nav.home', href: '/dashboard', icon: LayoutDashboardIcon },
  { key: 'nav.inventory', href: '/inventory', icon: BackpackIcon },
  { key: 'nav.quests', href: '/quests', icon: ScrollTextIcon },
  { key: 'nav.crafting', href: '/crafting', icon: HammerIcon },
  { key: 'nav.travel', href: '/travel', icon: PlaneIcon },
]

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
      {/* ═══ TOP HUD BAR ═══ */}
      <header className="sticky top-0 z-50 border-b bg-zinc-900 text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-3 py-2">
          {/* Left: Location */}
          <Link
            href="/travel"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium hover:bg-white/10 transition-colors shrink-0"
          >
            {isTraveling ? (
              <span className="flex items-center gap-1 text-primary font-bold animate-pulse">
                <PlaneIcon className="size-3.5" /> {Math.ceil(travelCountdown / 1000)}s
              </span>
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

          {/* Right: Money + Language */}
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

      {/* ═══ LOCATION SUB-NAV — shows facilities at current location ═══ */}
      {!isTraveling && facilities.length > 0 && (
        <div className="sticky top-[41px] z-40 border-b border-white/10 bg-zinc-800/95 backdrop-blur-sm text-white">
          <div className="mx-auto max-w-2xl overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 px-2 py-1.5 min-w-min">
              {facilities.map((f) => {
                const isActive = pathname === f.href
                return (
                  <Link
                    key={f.href}
                    href={f.href}
                    className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/8'
                      }`}
                  >
                    <f.Icon className="size-3.5" />
                    {f.label}
                    {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Traveling banner */}
      {isTraveling && (
        <div className="sticky top-[41px] z-40 border-b border-white/10 bg-zinc-800/95 backdrop-blur-sm text-white">
          <div className="mx-auto max-w-2xl px-3 py-2 text-center">
            <span className="text-xs text-white/50 flex items-center justify-center gap-1.5">
              <PlaneIcon className="size-3.5 animate-pulse text-primary" />
              {t('travel.headingTo', { location: t(`loc.${player.travelingTo}`) })}
              <span className="font-mono text-primary font-bold">{Math.ceil(travelCountdown / 1000)}s</span>
            </span>
          </div>
        </div>
      )}

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

      {/* ═══ BOTTOM NAV BAR (5 items — personal/global only) ═══ */}
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-zinc-900/95 backdrop-blur-sm text-white safe-area-pb">
        <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-1">
          {BOTTOM_NAV.map((item) => {
            const label = t(item.key)
            const isExact = pathname === item.href
            const isOnFacilityPage = item.href === '/dashboard' && !BOTTOM_NAV.some(n => n.href === pathname)
            const isActive = isExact || isOnFacilityPage
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1 h-14 min-w-[64px] sm:min-w-[72px] px-1 rounded-xl text-xs transition-colors ${isActive
                  ? 'text-white bg-white/15'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
              >
                <item.icon className="size-5" />
                <span className={`text-[10px] font-medium ${isActive ? 'text-white' : ''}`}>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
