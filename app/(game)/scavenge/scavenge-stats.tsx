'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    StarIcon, FlameIcon, WrenchIcon,
} from 'lucide-react'
import { ITEMS } from '@/lib/game/constants'
import { RarityBadge } from '@/components/game/rarity-badge'

type ScavengeStatsProps = {
    scavengeLevel: number
    scavengeXp: number
    xpNeeded: number
    xpProgress: number
    currentStreak: number
    streakBonus: { lootBonus: number }
    equippedTool: string | null
    t: (key: string, params?: Record<string, string>) => string
}

export function ScavengeStats({
    scavengeLevel,
    scavengeXp,
    xpNeeded,
    xpProgress,
    currentStreak,
    streakBonus,
    equippedTool,
    t,
}: ScavengeStatsProps) {
    const equippedDef = equippedTool ? ITEMS[equippedTool] : null

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Level Card */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
                <CardContent className="p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="rounded-full bg-yellow-500/10 p-1.5">
                            <StarIcon className="size-4 text-yellow-500" />
                        </div>
                        <span className="text-sm font-semibold">{t('scavenge.levelTitle')}</span>
                    </div>
                    <div className="flex items-end justify-between mb-1.5">
                        <span className="text-2xl font-bold">{scavengeLevel}</span>
                        <span className="text-xs text-muted-foreground">
                            {scavengeXp}/{xpNeeded} XP
                        </span>
                    </div>
                    <Progress value={xpProgress} className="h-1.5" />
                </CardContent>
            </Card>

            {/* Streak Card */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
                <CardContent className="p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="rounded-full bg-orange-500/10 p-1.5">
                            <FlameIcon className="size-4 text-orange-500" />
                        </div>
                        <span className="text-sm font-semibold">Streak</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold">{currentStreak}x</span>
                        {streakBonus.lootBonus > 0 && (
                            <Badge variant="outline" className="text-orange-500 border-orange-500/30 text-[10px]">
                                +{Math.round(streakBonus.lootBonus * 100)}% loot
                            </Badge>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {currentStreak >= 3
                            ? t('scavenge.streakBonus', { bonus: String(Math.round(streakBonus.lootBonus * 100)) })
                            : `${3 - currentStreak} lagi untuk bonus`
                        }
                    </p>
                </CardContent>
            </Card>

            {/* Equipped Tool Card */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                <CardContent className="p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="rounded-full bg-blue-500/10 p-1.5">
                            <WrenchIcon className="size-4 text-blue-500" />
                        </div>
                        <span className="text-sm font-semibold">{t('scavenge.equippedTool')}</span>
                    </div>
                    {equippedDef ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{t(`item.${equippedDef.id}`)}</p>
                                <RarityBadge rarity={equippedDef.rarity} label={t(`rarity.${equippedDef.rarity}`)} />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('scavenge.noTool')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
