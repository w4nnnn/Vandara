'use client'

import Link from 'next/link'
import { PlaneIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Facility = {
    name: string
    href: string
    Icon: LucideIcon
    label: string
}

type LocationNavProps = {
    isTraveling: boolean
    travelCountdown: number
    travelingTo: string | null
    facilities: Facility[]
    pathname: string
    t: (key: string, params?: Record<string, string>) => string
}

export function LocationNav({
    isTraveling,
    travelCountdown,
    travelingTo,
    facilities,
    pathname,
    t,
}: LocationNavProps) {
    // Location sub-nav — shows facilities at current location
    if (!isTraveling && facilities.length > 0) {
        return (
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
        )
    }

    // Traveling banner
    if (isTraveling) {
        return (
            <div className="sticky top-[41px] z-40 border-b border-white/10 bg-zinc-800/95 backdrop-blur-sm text-white">
                <div className="mx-auto max-w-2xl px-3 py-2 text-center">
                    <span className="text-xs text-white/50 flex items-center justify-center gap-1.5">
                        <PlaneIcon className="size-3.5 animate-pulse text-primary" />
                        {t('travel.headingTo', { location: t(`loc.${travelingTo}`) })}
                        <span className="font-mono text-primary font-bold">{Math.ceil(travelCountdown / 1000)}s</span>
                    </span>
                </div>
            </div>
        )
    }

    return null
}
