'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    HeartIcon,
    BoltIcon,
    BrainIcon,
    SmileIcon,
} from 'lucide-react'
import {
    ENERGY_REGEN_RATE,
    ENERGY_REGEN_INTERVAL_MS,
    NERVE_REGEN_RATE,
    NERVE_REGEN_INTERVAL_MS,
    HEALTH_REGEN_RATE,
    HEALTH_REGEN_INTERVAL_MS,
    HAPPY_REGEN_RATE,
    HAPPY_REGEN_INTERVAL_MS,
} from '@/lib/game/constants'

type RegenStat = {
    key: string
    label: string
    current: number
    max: number
    rate: number
    intervalMs: number
    icon: React.ElementType
    color: string
    bgColor: string
}

type PlayerStats = {
    energy: number
    maxEnergy: number
    nerve: number
    maxNerve: number
    health: number
    maxHealth: number
    happy: number
    maxHappy: number
    updatedAt: Date
}

function formatCountdown(ms: number): string {
    if (ms <= 0) return '0:00'
    const totalSec = Math.ceil(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

export default function RegenTimer({ player }: { player: PlayerStats }) {
    const buildStats = useCallback((): RegenStat[] => [
        {
            key: 'health',
            label: 'Health',
            current: player.health,
            max: player.maxHealth,
            rate: HEALTH_REGEN_RATE,
            intervalMs: HEALTH_REGEN_INTERVAL_MS,
            icon: HeartIcon,
            color: 'bg-red-500',
            bgColor: 'text-red-500',
        },
        {
            key: 'energy',
            label: 'Energy',
            current: player.energy,
            max: player.maxEnergy,
            rate: ENERGY_REGEN_RATE,
            intervalMs: ENERGY_REGEN_INTERVAL_MS,
            icon: BoltIcon,
            color: 'bg-green-500',
            bgColor: 'text-green-500',
        },
        {
            key: 'nerve',
            label: 'Nerve',
            current: player.nerve,
            max: player.maxNerve,
            rate: NERVE_REGEN_RATE,
            intervalMs: NERVE_REGEN_INTERVAL_MS,
            icon: BrainIcon,
            color: 'bg-blue-500',
            bgColor: 'text-blue-500',
        },
        {
            key: 'happy',
            label: 'Happy',
            current: player.happy,
            max: player.maxHappy,
            rate: HAPPY_REGEN_RATE,
            intervalMs: HAPPY_REGEN_INTERVAL_MS,
            icon: SmileIcon,
            color: 'bg-yellow-500',
            bgColor: 'text-yellow-500',
        },
    ], [player])

    const [stats, setStats] = useState<RegenStat[]>(buildStats())
    const [countdowns, setCountdowns] = useState<Record<string, number>>({})

    // Recalculate when player prop changes (e.g. after server action)
    useEffect(() => {
        setStats(buildStats())
    }, [buildStats])

    // Tick every second — simulate regen client-side
    useEffect(() => {
        const lastUpdate = new Date(player.updatedAt).getTime()

        const tick = () => {
            const now = Date.now()
            const elapsed = now - lastUpdate
            const newCountdowns: Record<string, number> = {}

            setStats((prev) =>
                prev.map((stat) => {
                    if (stat.current >= stat.max) {
                        newCountdowns[stat.key] = 0
                        return stat
                    }

                    // How many ticks have passed since last server update
                    const totalTicks = Math.floor(elapsed / stat.intervalMs)
                    const gained = totalTicks * stat.rate
                    const newVal = Math.min(stat.current + gained, stat.max)

                    // Time until next tick
                    const nextTickAt = (totalTicks + 1) * stat.intervalMs
                    const msUntilNext = Math.max(0, nextTickAt - elapsed)
                    newCountdowns[stat.key] = msUntilNext

                    // We need to compare against the original base value
                    const baseVal = stat.key === 'health' ? player.health
                        : stat.key === 'energy' ? player.energy
                            : stat.key === 'nerve' ? player.nerve
                                : player.happy

                    const simulated = Math.min(baseVal + gained, stat.max)

                    return { ...stat, current: simulated }
                })
            )

            setCountdowns(newCountdowns)
        }

        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [player])

    return (
        <div className="space-y-3">
            {stats.map((stat) => {
                const pct = Math.round((stat.current / stat.max) * 100)
                const isFull = stat.current >= stat.max
                const countdown = countdowns[stat.key] ?? 0
                const Icon = stat.icon

                return (
                    <div key={stat.key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 font-medium">
                                <Icon className="size-3.5" />
                                {stat.label}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                    {stat.current} / {stat.max}
                                </span>
                                {!isFull && (
                                    <span className="text-[10px] tabular-nums text-muted-foreground/70 font-mono">
                                        +{stat.rate} in {formatCountdown(countdown)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear ${stat.color}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
