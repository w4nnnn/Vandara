'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AvatarComponent from '@/avataaars-assets'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  LayoutDashboardIcon,
  SwordIcon,
  SwordsIcon,
  DumbbellIcon,
  BackpackIcon,
  BriefcaseIcon,
  PlaneIcon,
  LockIcon,
  HeartPulseIcon,
  MapPinIcon,
} from 'lucide-react'
import { LOCATIONS, ACTIVITY_LOCATIONS, type LocationId } from '@/lib/game/constants'

type Player = {
  id: number
  name: string
  level: number
  money: number | bigint
  currentLocation: string
  travelingTo: string | null
  avatar?: {
    avatarStyle: string
    topType: string
    accessoriesType: string
    hatColor: string
    hairColor: string
    facialHairType: string
    facialHairColor: string
    clotheType: string
    clotheColor: string
    graphicType: string
    eyeType: string
    eyebrowType: string
    mouthType: string
    skinColor: string
  } | null
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
    activity: null, // available everywhere
  },
  {
    label: 'Travel',
    href: '/travel',
    icon: PlaneIcon,
    activity: null, // available everywhere
  },
  {
    label: 'Combat',
    href: '/combat',
    icon: SwordsIcon,
    activity: 'combat' as const,
  },
  {
    label: 'Gym',
    href: '/gym',
    icon: DumbbellIcon,
    activity: 'gym' as const,
  },
  {
    label: 'Jobs',
    href: '/jobs',
    icon: BriefcaseIcon,
    activity: 'jobs' as const,
  },
  {
    label: 'Hospital',
    href: '/hospital',
    icon: HeartPulseIcon,
    activity: 'hospital' as const,
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: BackpackIcon,
    activity: null, // available everywhere
  },
]

export default function GameLayoutClient({
  player,
  children,
}: {
  player: Player
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                {player.avatar && (
                  <AvatarComponent
                    avatarStyle={player.avatar.avatarStyle}
                    topType={player.avatar.topType}
                    accessoriesType={player.avatar.accessoriesType}
                    hatColor={player.avatar.hatColor}
                    hairColor={player.avatar.hairColor}
                    facialHairType={player.avatar.facialHairType}
                    facialHairColor={player.avatar.facialHairColor}
                    clotheType={player.avatar.clotheType}
                    clotheColor={player.avatar.clotheColor}
                    graphicType={player.avatar.graphicType}
                    eyeType={player.avatar.eyeType}
                    eyebrowType={player.avatar.eyebrowType}
                    mouthType={player.avatar.mouthType}
                    skinColor={player.avatar.skinColor}
                    style={{ width: '48px', height: '48px' }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{player.name}</p>
                <p className="text-xs text-muted-foreground">
                  Level {player.level}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPinIcon className="size-3" />
                  {player.travelingTo
                    ? `Traveling to ${LOCATIONS[player.travelingTo as LocationId]?.label ?? player.travelingTo}...`
                    : (LOCATIONS[player.currentLocation as LocationId]?.label ?? player.currentLocation)
                  }
                </p>
              </div>
            </div>
          </SidebarHeader>

          <Separator />

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Game</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map((item) => {
                    const requiredLocation = item.activity ? ACTIVITY_LOCATIONS[item.activity] : null
                    const isAtLocation = !requiredLocation || player.currentLocation === requiredLocation
                    const enabled = isAtLocation && !player.travelingTo
                    const locationLabel = requiredLocation ? LOCATIONS[requiredLocation]?.label : null
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild={enabled}
                          isActive={pathname === item.href}
                          disabled={!enabled}
                          tooltip={
                            !enabled && locationLabel
                              ? `Travel to ${locationLabel} first`
                              : !enabled && player.travelingTo
                                ? 'Currently traveling'
                                : undefined
                          }
                        >
                          {enabled ? (
                            <Link href={item.href}>
                              <item.icon className="size-4" />
                              <span>{item.label}</span>
                            </Link>
                          ) : (
                            <span className="opacity-50">
                              <item.icon className="size-4" />
                              <span>{item.label}</span>
                              <LockIcon className="ml-auto size-3" />
                            </span>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              💰 ${Number(player.money).toLocaleString()}
            </p>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-sm font-semibold">
              {NAV_ITEMS.find((i) => i.href === pathname)?.label ?? 'Game'}
            </h1>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
