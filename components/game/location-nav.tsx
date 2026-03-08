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
            <div className="sticky top-[53px] z-40 border-b border-white/5 bg-zinc-800/60 backdrop-blur-xl text-white shadow-md">
                <div className="mx-auto max-w-2xl overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-1.5 px-3 py-2 min-w-min">
                        {facilities.map((f) => {
                            const isActive = pathname === f.href
                            return (
                                <Link
                                    key={f.href}
                                    href={f.href}
                                    className={`group relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-primary/30 to-primary/10 text-white shadow-md scale-105'
                                            : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <f.Icon className={`size-4 transition-colors duration-200 ${isActive ? 'text-white' : ''}`} />
                                    {f.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-primary to-transparent" />
                                    )}
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
            <div className="sticky top-[53px] z-40 border-b border-white/5 bg-zinc-800/60 backdrop-blur-xl text-white shadow-md">
                <div className="mx-auto max-w-2xl px-3 py-3 text-center">
                    <span className="text-xs text-white/60 flex items-center justify-center gap-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/30 blur-md rounded-full" />
                            <PlaneIcon className="relative size-4 animate-pulse text-primary" />
                        </div>
                        <span>{t('travel.headingTo', { location: t(`loc.${travelingTo}`) })}</span>
                        <span className="font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                            {Math.ceil(travelCountdown / 1000)}s
                        </span>
                    </span>
                </div>
            </div>
        )
    }

    return null
}
