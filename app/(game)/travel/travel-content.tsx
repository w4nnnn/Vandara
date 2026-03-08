'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
    PlaneIcon,
    MapPinIcon,
    ClockIcon,
    AlertTriangleIcon,
    HeartPulseIcon,
    CheckCircleIcon,
    BuildingIcon,
    DumbbellIcon,
    BriefcaseIcon,
    HospitalIcon,
    NavigationIcon,
    SparklesIcon,
    TimerIcon,
    FactoryIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { startTravel } from '@/app/actions/travel'
import { LOCATIONS, TRAVEL_TIMES, LOCATION_IDS, type LocationId } from '@/lib/game/constants'
import { useTranslation } from '@/lib/i18n'

type Player = {
    id: number
    name: string
    level: number
    currentLocation: string
    travelingTo: string | null
    travelingUntil: Date | null
    isHospitalized: boolean
}

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

const LOCATION_GRADIENTS: Record<LocationId, string> = {
    city_center: 'from-blue-500/10 to-cyan-500/5 border-blue-500/20',
    gym_district: 'from-red-500/10 to-orange-500/5 border-red-500/20',
    business_district: 'from-purple-500/10 to-violet-500/5 border-purple-500/20',
    dark_alley: 'from-slate-500/10 to-gray-500/5 border-slate-500/20',
    hospital: 'from-green-500/10 to-emerald-500/5 border-green-500/20',
    port_docks: 'from-cyan-500/10 to-blue-500/5 border-cyan-500/20',
    university_district: 'from-indigo-500/10 to-purple-500/5 border-indigo-500/20',
    industrial_zone: 'from-orange-500/10 to-amber-500/5 border-orange-500/20',
    waterfront: 'from-teal-500/10 to-cyan-500/5 border-teal-500/20',
    underground: 'from-zinc-500/10 to-neutral-500/5 border-zinc-500/20',
}

const LOCATION_ACCENT_COLORS: Record<LocationId, string> = {
    city_center: 'text-blue-500',
    gym_district: 'text-red-500',
    business_district: 'text-purple-500',
    dark_alley: 'text-slate-500',
    hospital: 'text-green-500',
    port_docks: 'text-cyan-500',
    university_district: 'text-indigo-500',
    industrial_zone: 'text-orange-500',
    waterfront: 'text-teal-500',
    underground: 'text-zinc-500',
}

function formatCountdown(ms: number): string {
    if (ms <= 0) return '0s'
    const totalSec = Math.ceil(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

export default function TravelContent({ player }: { player: Player }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const { t } = useTranslation()
    const [error, setError] = useState<string | null>(null)

    // Travel countdown
    const [countdown, setCountdown] = useState<number>(0)
    const isTraveling = !!player.travelingTo && !!player.travelingUntil

    useEffect(() => {
        if (!isTraveling || !player.travelingUntil) return
        const target = new Date(player.travelingUntil).getTime()

        const tick = () => {
            const ms = target - Date.now()
            if (ms <= 0) {
                setCountdown(0)
                router.refresh()
                return
            }
            setCountdown(ms)
        }
        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [isTraveling, player.travelingUntil, router])

    const handleTravel = (destinationId: string) => {
        setError(null)
        startTransition(async () => {
            const res = await startTravel(destinationId)
            if ('error' in res) {
                setError(res.error ?? 'An error occurred')
                return
            }
            router.refresh()
        })
    }

    const currentLoc = LOCATIONS[player.currentLocation as LocationId]
    const travelingToLoc = player.travelingTo ? LOCATIONS[player.travelingTo as LocationId] : null

    return (
        <div className="space-y-6">
            {/* Hospital Banner */}
            {player.isHospitalized && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <HeartPulseIcon className="size-4" />
                    <AlertTitle>{t('hospital.beingTreated')}</AlertTitle>
                    <AlertDescription>
                        {t('travel.cantTravel')}
                    </AlertDescription>
                </Alert>
            )}

            {/* Error */}
            {error && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertTriangleIcon className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Travel Status Card */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <CardContent className="relative p-6">
                    {isTraveling && travelingToLoc ? (
                        <div className="flex flex-col items-center gap-4 py-4 text-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                <div className="relative rounded-full bg-primary/10 p-4">
                                    <PlaneIcon className="size-8 text-primary animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    <NavigationIcon className={`size-5 ${LOCATION_ACCENT_COLORS[player.travelingTo as LocationId]}`} />
                                    <p className="text-xl font-semibold">{t('travel.headingTo', { location: t(`loc.${player.travelingTo}`) })}</p>
                                </div>
                                <p className="text-sm text-muted-foreground max-w-md">{t(`loc.${player.travelingTo}.desc`)}</p>
                            </div>
                            <div className="flex items-center gap-2 text-3xl font-bold tabular-nums">
                                <TimerIcon className="size-6 text-muted-foreground" />
                                {formatCountdown(countdown)}
                            </div>
                            <div className="w-full max-w-md space-y-2">
                                <Progress
                                    value={player.travelingUntil ? Math.max(0, Math.min(100, ((TRAVEL_TIMES[player.currentLocation as LocationId]?.[player.travelingTo as LocationId] ?? 30) * 1000 - countdown) / ((TRAVEL_TIMES[player.currentLocation as LocationId]?.[player.travelingTo as LocationId] ?? 30) * 1000) * 100)) : 0}
                                    className="h-3"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t('travel.estimatedTime')}: {TRAVEL_TIMES[player.currentLocation as LocationId]?.[player.travelingTo as LocationId] ?? 30}s
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-4">
                            <div className={`relative shrink-0 rounded-xl border p-3 ${currentLoc && LOCATION_GRADIENTS[currentLoc.id as LocationId]}`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl" />
                                <div className="relative">
                                    {currentLoc && (() => { const Icon = LOCATION_ICONS[currentLoc.id]; return <Icon className="size-6 text-primary" /> })()}
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <MapPinIcon className="size-5 text-primary" />
                                    <p className="font-semibold text-lg">
                                        {currentLoc ? t(`loc.${currentLoc.id}`) : player.currentLocation}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {currentLoc ? t(`loc.${currentLoc.id}.desc`) : ''}
                                </p>
                                {currentLoc?.facilities && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {currentLoc.facilities.map((f) => (
                                            <Badge key={f} variant="secondary" className="text-xs">{t(`facility.${f}`)}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Destinations */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                <CardHeader className="relative pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <div className="rounded-lg bg-primary/10 p-1.5">
                            <PlaneIcon className="size-5 text-primary" />
                        </div>
                        {t('travel.destinations')}
                    </CardTitle>
                    <CardDescription>
                        {t('travel.destinationsDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                    <div className="grid gap-3">
                        {LOCATION_IDS.map((locId) => {
                            const loc = LOCATIONS[locId]
                            if (!loc) return null
                            const isCurrent = player.currentLocation === locId
                            const travelTime = TRAVEL_TIMES[player.currentLocation as LocationId]?.[locId] ?? 0
                            const gradient = LOCATION_GRADIENTS[locId]

                            return (
                                <div
                                    key={locId}
                                    className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${isCurrent
                                            ? `${gradient} bg-primary/10`
                                            : 'hover:border-primary/30 hover:bg-primary/5'
                                        }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/0 group-hover:to-primary/5 transition-all duration-200" />

                                    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <div className={`flex shrink-0 items-center justify-center rounded-lg border bg-card p-2 ${LOCATION_ACCENT_COLORS[locId]}`}>
                                                    {(() => { const Icon = LOCATION_ICONS[loc.id]; return <Icon className="size-4" /> })()}
                                                </div>
                                                <h3 className="font-semibold text-base">{t(`loc.${loc.id}`)}</h3>
                                                {isCurrent && (
                                                    <Badge className="gap-1 text-xs bg-primary/20">
                                                        <CheckCircleIcon className="size-3" />
                                                        {t('travel.youAreHere')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{t(`loc.${loc.id}.desc`)}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {loc.facilities.map((f) => (
                                                    <Badge key={f} variant="outline" className="text-xs">{t(`facility.${f}`)}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {!isCurrent && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                                                    <ClockIcon className="size-3.5" />
                                                    <span className="font-medium">{travelTime}s</span>
                                                </div>
                                            )}
                                            <Button
                                                variant={isCurrent ? 'secondary' : 'default'}
                                                size="sm"
                                                disabled={isCurrent || isTraveling || isPending || player.isHospitalized}
                                                onClick={() => handleTravel(locId)}
                                                className={isCurrent ? '' : 'transition-all duration-200 hover:shadow-md'}
                                            >
                                                {isPending ? t('travel.traveling') : isCurrent ? t('travel.here') : t('travel.go')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
