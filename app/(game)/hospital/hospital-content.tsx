'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
    HeartPulseIcon, HeartIcon, ClockIcon,
    CheckCircle2Icon, SwordsIcon, BackpackIcon,
} from 'lucide-react'

type Player = {
    id: number
    name: string
    health: number
    maxHealth: number
    isHospitalized: boolean
    hospitalUntil: Date | null
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
}

export default function HospitalContent({ player }: { player: Player }) {
    const router = useRouter()
    const [remainingSeconds, setRemainingSeconds] = useState(0)

    useEffect(() => {
        if (!player.isHospitalized || !player.hospitalUntil) {
            setRemainingSeconds(0)
            return
        }

        const updateTimer = () => {
            const now = Date.now()
            const until = new Date(player.hospitalUntil!).getTime()
            const diff = Math.max(0, Math.ceil((until - now) / 1000))
            setRemainingSeconds(diff)
            if (diff <= 0) {
                // Hospital time is up, refresh to update state
                router.refresh()
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [player.isHospitalized, player.hospitalUntil, router])

    const isHospitalized = player.isHospitalized && remainingSeconds > 0

    return (
        <div className="space-y-6">
            {isHospitalized ? (
                <>
                    {/* Hospitalized State */}
                    <Alert variant="destructive">
                        <HeartPulseIcon className="size-4" />
                        <AlertTitle>You are hospitalized</AlertTitle>
                        <AlertDescription>
                            You were defeated in combat and need time to recover.
                            All activities (gym, work, combat) are blocked until you are discharged.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ClockIcon className="size-5 text-red-500" />
                                Recovery Timer
                            </CardTitle>
                            <CardDescription>
                                You will be automatically discharged when the timer reaches zero.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <p className="text-5xl font-bold font-mono tabular-nums text-red-500">
                                    {formatTime(remainingSeconds)}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">remaining</p>
                            </div>

                            {/* Progress bar */}
                            {player.hospitalUntil && (
                                <div className="space-y-1">
                                    <Progress
                                        value={Math.max(0, 100 - (remainingSeconds / 60) * 10)}
                                        className="h-3"
                                    />
                                    <p className="text-xs text-muted-foreground text-center">
                                        Recovery progress
                                    </p>
                                </div>
                            )}

                            {/* Health display */}
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <span className="flex items-center gap-2 text-sm">
                                    <HeartIcon className="size-4 text-red-500" />
                                    Health
                                </span>
                                <span className="font-semibold text-red-500">
                                    {player.health} / {player.maxHealth}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick Recovery</CardTitle>
                            <CardDescription>
                                Use health potions from your inventory to recover faster.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" className="gap-2">
                                <Link href="/inventory">
                                    <BackpackIcon className="size-4" />
                                    Go to Inventory
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <>
                    {/* Healthy State */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CheckCircle2Icon className="size-5 text-green-500" />
                                You&apos;re Healthy
                            </CardTitle>
                            <CardDescription>
                                You are not hospitalized. Stay safe out there!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <span className="flex items-center gap-2 text-sm">
                                    <HeartIcon className="size-4 text-green-500" />
                                    Health
                                </span>
                                <span className="font-semibold text-green-500">
                                    {player.health} / {player.maxHealth}
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <Button asChild variant="default" className="gap-2">
                                    <Link href="/combat">
                                        <SwordsIcon className="size-4" />
                                        Go to Combat
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="gap-2">
                                    <Link href="/inventory">
                                        <BackpackIcon className="size-4" />
                                        Inventory
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
