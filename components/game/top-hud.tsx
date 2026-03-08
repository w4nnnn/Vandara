'use client'

import Link from 'next/link'
import {
    HeartIcon,
    BoltIcon,
    BrainIcon,
    SmileIcon,
    CoinsIcon,
    PlaneIcon,
    ArrowRightLeftIcon,
    BuildingIcon,
    DumbbellIcon,
    BriefcaseIcon,
    MapPinIcon,
    HospitalIcon,
    FactoryIcon,
    SparklesIcon,
    NavigationIcon,
    AlertTriangleIcon,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { LOCATIONS, type LocationId } from '@/lib/game/constants'
import type { Locale } from '@/lib/i18n'
import type { LucideIcon } from 'lucide-react'

const LOCATION_ICONS: Record<LocationId, LucideIcon> = {
    city_center: BuildingIcon,
    gym_district: DumbbellIcon,
    business_district: BriefcaseIcon,
    dark_alley: MapPinIcon,
    hospital: HospitalIcon,
    port_docks: PlaneIcon,
    university_district: SparklesIcon,
    industrial_zone: FactoryIcon,
    waterfront: NavigationIcon,
    underground: AlertTriangleIcon,
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
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 min-w-0 cursor-help">
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
            </TooltipTrigger>
            <TooltipContent side="bottom" className="border-white/10 bg-zinc-800/95 text-white">
                <p className="font-semibold">{label}</p>
                <p className="text-xs text-white/70 mt-0.5">
                    {current} / {max} ({pct}%)
                </p>
            </TooltipContent>
        </Tooltip>
    )
}

type TopHudProps = {
    isTraveling: boolean
    travelCountdown: number
    currentLoc: { id: LocationId } | undefined
    stats: { health: number; energy: number; nerve: number; happy: number }
    maxStats: { health: number; energy: number; nerve: number; happy: number }
    money: number | bigint
    isHospitalized: boolean
    locale: Locale
    setLocale: (l: Locale) => void
    dir: string
    toggleDir: () => void
    t: (key: string) => string
}

export function TopHud({
    isTraveling,
    travelCountdown,
    currentLoc,
    stats,
    maxStats,
    money,
    isHospitalized,
    locale,
    setLocale,
    dir,
    toggleDir,
    t,
}: TopHudProps) {
    return (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-900/80 backdrop-blur-xl text-white shadow-lg">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-3 py-2.5">
                {/* Left: Location */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href="/travel"
                            className="group flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-white/10 transition-all duration-200 shrink-0 hover:scale-105"
                        >
                            {isTraveling ? (
                                <span className="flex items-center gap-1.5 text-primary font-bold animate-pulse">
                                    <PlaneIcon className="size-4" /> 
                                    <span className="font-mono">{Math.ceil(travelCountdown / 1000)}s</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    {currentLoc && (() => { const Icon = LOCATION_ICONS[currentLoc.id]; return <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" /> })()}
                                    <span className="hidden sm:inline">{t(`loc.${currentLoc?.id}`) || t('unknown')}</span>
                                    <span className="sm:hidden">{t(`loc.${currentLoc?.id}`).split(' ').map(w => w[0]).join('').slice(0, 2)}</span>
                                </span>
                            )}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="border-white/10 bg-zinc-800/95 text-white">
                        <p className="font-semibold">{t('travel.destinations')}</p>
                        <p className="text-xs text-white/70 mt-0.5">
                            {isTraveling 
                                ? `${t('travel.headingTo')} - ${Math.ceil(travelCountdown / 1000)}s`
                                : `${t('travel.here')} - ${t(`loc.${currentLoc?.id}`)}`
                            }
                        </p>
                    </TooltipContent>
                </Tooltip>

                {/* Center: Stat Bars */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <HudStat icon={HeartIcon} current={stats.health} max={maxStats.health} color="text-red-500" label={t('health')} />
                    <HudStat icon={BoltIcon} current={stats.energy} max={maxStats.energy} color="text-green-500" label={t('energy')} />
                    <HudStat icon={BrainIcon} current={stats.nerve} max={maxStats.nerve} color="text-blue-500" label={t('nerve')} />
                    <HudStat icon={SmileIcon} current={stats.happy} max={maxStats.happy} color="text-yellow-500" label={t('happy')} />
                </div>

                {/* Right: Money + Language */}
                <div className="flex items-center gap-1.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-1.5 rounded-lg border border-emerald-500/20 cursor-help">
                                <CoinsIcon className="size-4" />
                                <span className="tabular-nums">
                                    ${Number(money) >= 1000
                                        ? `${(Number(money) / 1000).toFixed(1)}K`
                                        : Number(money).toLocaleString()}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="border-white/10 bg-zinc-800/95 text-white">
                            <p className="font-semibold">{t('balance')}</p>
                            <p className="text-xs text-white/70 mt-0.5">
                                ${Number(money).toLocaleString()}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                aria-label={t('hud.language')}
                                onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-[10px] font-bold uppercase transition-all duration-200 hover:scale-110"
                                title={t('hud.language')}
                            >
                                {locale === 'id' ? 'EN' : 'ID'}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="border-white/10 bg-zinc-800/95 text-white">
                            <p>{t('hud.language')}</p>
                            <p className="text-xs text-white/70 mt-0.5">
                                {locale === 'id' ? 'Bahasa Indonesia' : 'English'}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                aria-label="Toggle RTL/LTR"
                                onClick={toggleDir}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-110"
                                title={`${dir.toUpperCase()}`}
                            >
                                <ArrowRightLeftIcon className="size-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="border-white/10 bg-zinc-800/95 text-white">
                            <p>Toggle Text Direction</p>
                            <p className="text-xs text-white/70 mt-0.5">
                                Current: {dir.toUpperCase()} (Left-to-Right)
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Hospitalized banner */}
            {isHospitalized && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center justify-center gap-2 bg-red-500/10 border-t border-red-500/20 text-center text-xs text-red-300 py-2 font-medium cursor-help">
                            <HospitalIcon className="size-3.5 animate-pulse" /> {t('hud.hospitalized')}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="border-red-500/20 bg-red-900/90 text-red-100">
                        <p className="font-semibold">{t('dashboard.hospitalized')}</p>
                        <p className="text-xs text-red-200 mt-0.5">
                            {t('dashboard.hospitalizedDesc')}
                        </p>
                    </TooltipContent>
                </Tooltip>
            )}
        </header>
    )
}
