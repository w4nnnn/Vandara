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
} from 'lucide-react'
import { LOCATIONS, type LocationId } from '@/lib/game/constants'
import type { Locale } from '@/lib/i18n'
import type { LucideIcon } from 'lucide-react'

const LOCATION_ICONS: Record<LocationId, LucideIcon> = {
    city_center: BuildingIcon,
    gym_district: DumbbellIcon,
    business_district: BriefcaseIcon,
    dark_alley: MapPinIcon,
    hospital: HospitalIcon,
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
                    <HudStat icon={HeartIcon} current={stats.health} max={maxStats.health} color="text-red-500" label={t('health')} />
                    <HudStat icon={BoltIcon} current={stats.energy} max={maxStats.energy} color="text-green-500" label={t('energy')} />
                    <HudStat icon={BrainIcon} current={stats.nerve} max={maxStats.nerve} color="text-blue-500" label={t('nerve')} />
                    <HudStat icon={SmileIcon} current={stats.happy} max={maxStats.happy} color="text-yellow-500" label={t('happy')} />
                </div>

                {/* Right: Money + Language */}
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
                        <CoinsIcon className="size-3.5" />
                        <span className="tabular-nums">
                            ${Number(money) >= 1000
                                ? `${(Number(money) / 1000).toFixed(1)}K`
                                : Number(money).toLocaleString()}
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
            {isHospitalized && (
                <div className="flex items-center justify-center gap-1.5 bg-red-900/80 text-center text-xs text-red-200 py-1 font-medium">
                    <HospitalIcon className="size-3.5" /> {t('hud.hospitalized')}
                </div>
            )}
        </header>
    )
}
