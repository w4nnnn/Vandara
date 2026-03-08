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
        <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl text-white safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
            <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2">
                {BOTTOM_NAV.map((item) => {
                    const label = t(item.key)
                    const isExact = pathname === item.href
                    const isOnFacilityPage = item.href === '/dashboard' && !BOTTOM_NAV.some(n => n.href === pathname)
                    const isActive = isExact || isOnFacilityPage
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group relative flex flex-col items-center justify-center gap-1 h-16 min-w-[64px] sm:min-w-[72px] px-1 rounded-2xl text-xs transition-all duration-300 ${
                                isActive
                                    ? 'text-white bg-gradient-to-b from-primary/30 to-primary/10 scale-110 shadow-lg'
                                    : 'text-white/50 hover:text-white hover:bg-white/10 hover:scale-105'
                            }`}
                        >
                            {isActive && (
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/50 blur-sm" />
                            )}
                            <item.icon className={`size-5 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110 group-hover:text-white'}`} />
                            <span className={`text-[10px] font-medium transition-colors duration-300 ${
                                isActive ? 'text-white font-semibold' : 'group-hover:text-white'
                            }`}>{label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
