'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    PlaneIcon,
    MapPinIcon,
    ClockIcon,
    AlertTriangleIcon,
    HeartPulseIcon,
    CheckCircleIcon,
} from 'lucide-react'
import { startTravel } from '@/app/actions/travel'
import { LOCATIONS, TRAVEL_TIMES, LOCATION_IDS, type LocationId } from '@/lib/game/constants'

type Player = {
    id: number
    name: string
    level: number
    currentLocation: string
    travelingTo: string | null
    travelingUntil: Date | null
    isHospitalized: boolean
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
                <Alert variant="destructive">
                    <HeartPulseIcon className="size-4" />
                    <AlertTitle>Hospitalized</AlertTitle>
                    <AlertDescription>
                        You are in the hospital and cannot travel.
                    </AlertDescription>
                </Alert>
            )}

            {/* Error */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangleIcon className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Current location / Traveling status */}
            <Card>
                <CardContent className="p-4">
                    {isTraveling && travelingToLoc ? (
                        <div className="flex flex-col items-center gap-3 py-4 text-center">
                            <PlaneIcon className="size-8 text-primary animate-pulse" />
                            <div>
                                <p className="text-lg font-semibold">Traveling to {travelingToLoc.label}...</p>
                                <p className="text-sm text-muted-foreground">{travelingToLoc.description}</p>
                            </div>
                            <div className="flex items-center gap-2 text-2xl font-bold tabular-nums">
                                <ClockIcon className="size-5 text-muted-foreground" />
                                {formatCountdown(countdown)}
                            </div>
                            <div className="w-full max-w-xs">
                                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                                    {player.travelingUntil && (() => {
                                        const totalTime = TRAVEL_TIMES[player.currentLocation as LocationId]?.[player.travelingTo as LocationId] ?? 30
                                        const totalMs = totalTime * 1000
                                        const pct = Math.max(0, Math.min(100, ((totalMs - countdown) / totalMs) * 100))
                                        return (
                                            <div
                                                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-1000 ease-linear"
                                                style={{ width: `${pct}%` }}
                                            />
                                        )
                                    })()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <MapPinIcon className="size-6 text-primary" />
                            <div>
                                <p className="font-semibold">
                                    {currentLoc?.icon} {currentLoc?.label ?? player.currentLocation}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {currentLoc?.description}
                                </p>
                                {currentLoc?.facilities && (
                                    <div className="mt-1 flex gap-1.5">
                                        {currentLoc.facilities.map((f) => (
                                            <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Destinations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <PlaneIcon className="size-5" />
                        Destinations
                    </CardTitle>
                    <CardDescription>
                        Travel to a location to access its facilities.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {LOCATION_IDS.map((locId) => {
                            const loc = LOCATIONS[locId]
                            const isCurrent = player.currentLocation === locId
                            const travelTime = TRAVEL_TIMES[player.currentLocation as LocationId]?.[locId] ?? 0

                            return (
                                <div
                                    key={locId}
                                    className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${isCurrent ? 'border-primary/50 bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{loc.icon}</span>
                                            <h3 className="font-semibold">{loc.label}</h3>
                                            {isCurrent && (
                                                <Badge className="gap-1 text-xs">
                                                    <CheckCircleIcon className="size-3" />
                                                    You are here
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{loc.description}</p>
                                        <div className="flex gap-1.5">
                                            {loc.facilities.map((f) => (
                                                <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {!isCurrent && (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <ClockIcon className="size-3" />
                                                {travelTime}s
                                            </span>
                                        )}
                                        <Button
                                            variant={isCurrent ? 'secondary' : 'default'}
                                            size="sm"
                                            disabled={isCurrent || isTraveling || isPending || player.isHospitalized}
                                            onClick={() => handleTravel(locId)}
                                        >
                                            {isPending ? 'Traveling...' : isCurrent ? 'Here' : 'Travel'}
                                        </Button>
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
