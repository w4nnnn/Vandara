'use client'

import Link from 'next/link'
import {
    LayoutDashboardIcon,
    BackpackIcon,
    ScrollTextIcon,
    HammerIcon,
    PlaneIcon,
} from 'lucide-react'

const BOTTOM_NAV = [
    { key: 'nav.home', href: '/dashboard', icon: LayoutDashboardIcon },
    { key: 'nav.inventory', href: '/inventory', icon: BackpackIcon },
    { key: 'nav.quests', href: '/quests', icon: ScrollTextIcon },
    { key: 'nav.crafting', href: '/crafting', icon: HammerIcon },
    { key: 'nav.travel', href: '/travel', icon: PlaneIcon },
]

export function BottomNav({ pathname, t }: { pathname: string; t: (key: string) => string }) {
    return (
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
    )
}
