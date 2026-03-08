'use client'

import { useState, useTransition, useMemo, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    SearchIcon, MapPinIcon, ZapIcon, ArchiveIcon, TrendingUpIcon, ScrollTextIcon,
} from 'lucide-react'
import { scavenge } from '@/app/actions/scavenge'
import {
    LOCATIONS, type LocationId,
    getScavengeChances, scavengeXpForLevel,
    SCAVENGE_ENERGY_COST, DOUBLE_ENERGY_COST,
    SCAVENGE_SPOTS,
    getStreakBonus,
} from '@/lib/game/constants'
import { useTranslation } from '@/lib/i18n'

import { ScavengeStats } from './scavenge-stats'
import { SpotSelector } from './spot-selector'
import { ScavengeMiniGame } from './scavenge-mini-game'
import { ScavengeDialogs } from './scavenge-dialogs'
import { LootChances } from './loot-chances'
import { ScavengeLog } from './scavenge-log'

type Player = {
    id: number
    name: string
    money: number | bigint
    energy: number
    maxEnergy: number
    health: number
    currentLocation: string
    scavengeLevel: number
    scavengeXp: number
    scavengeStreak: number
    scavengeStreakLocation: string | null
    equippedTool: string | null
}

type LogEntry = {
    id: number
    resultType: string
    itemId: string | null
    quantity: number | null
    moneyAmount: number | null
    eventType: string | null
    streak: number
    doubleMode: boolean
    createdAt: Date
}

type PlayerItem = {
    id: number
    itemId: string
    quantity: number
}

export default function ScavengeContent({
    player,
    logs,
    playerItems: pItems,
}: {
    player: Player
    logs: LogEntry[]
    playerItems: PlayerItem[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const { t } = useTranslation()
    const [result, setResult] = useState<{
        success?: boolean
        loot?: { money?: number; itemId?: string; quantity?: number }
        event?: { type: string; detail?: string } | null
        streak?: number
        healthLost?: number
        energyLost?: number
        error?: string
        xpGained?: number
        leveledUp?: boolean
        newLevel?: number
        newXp?: number
        xpNeeded?: number
        spotLabel?: string | null
    } | null>(null)
    const [loadingOpen, setLoadingOpen] = useState(false)
    const [resultOpen, setResultOpen] = useState(false)
    const [doubleMode, setDoubleMode] = useState(false)
    const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)

    // ─── Mini-Game State ──────────────────────────────────
    type MiniGameType = 'pick_trash' | 'guess_direction' | 'quick_tap'
    const [miniGameOpen, setMiniGameOpen] = useState(false)
    const [miniGameType, setMiniGameType] = useState<MiniGameType>('pick_trash')
    const [miniGameResult, setMiniGameResult] = useState<'playing' | 'won' | 'lost'>('playing')
    const [miniGameData, setMiniGameData] = useState<any>({})
    const tapCountRef = useRef(0)
    const tapTimerRef = useRef<NodeJS.Timeout | null>(null)

    const startMiniGame = () => {
        const types: MiniGameType[] = ['pick_trash', 'guess_direction', 'quick_tap']
        const type = types[Math.floor(Math.random() * types.length)]
        setMiniGameType(type)
        setMiniGameResult('playing')
        tapCountRef.current = 0

        if (type === 'pick_trash') {
            const correct = Math.floor(Math.random() * 3)
            setMiniGameData({ correct, revealed: false })
        } else if (type === 'guess_direction') {
            const correct = Math.random() < 0.5 ? 'left' : 'right'
            setMiniGameData({ correct, chosen: null })
        } else {
            setMiniGameData({ taps: 0, target: 10, timeLeft: 3, active: true })
        }

        setMiniGameOpen(true)
    }

    const finishMiniGame = useCallback((won: boolean) => {
        setMiniGameResult(won ? 'won' : 'lost')
        if (tapTimerRef.current) clearInterval(tapTimerRef.current)
        // After 1s delay, proceed with scavenge
        setTimeout(() => {
            setMiniGameOpen(false)
            setLoadingOpen(true)
            startTransition(async () => {
                const res = await scavenge(selectedSpotId, doubleMode, won)
                setResult(res)
                setLoadingOpen(false)
                setResultOpen(true)
                router.refresh()
            })
        }, 1200)
    }, [selectedSpotId, doubleMode, router])

    // Pick Trash handler
    const handlePickTrash = (idx: number) => {
        if (miniGameData.revealed) return
        const won = idx === miniGameData.correct
        setMiniGameData({ ...miniGameData, revealed: true, picked: idx })
        finishMiniGame(won)
    }

    // Guess Direction handler  
    const handleGuessDirection = (dir: 'left' | 'right') => {
        if (miniGameData.chosen) return
        const won = dir === miniGameData.correct
        setMiniGameData({ ...miniGameData, chosen: dir })
        finishMiniGame(won)
    }

    // Quick Tap handler
    const handleQuickTap = useCallback(() => {
        if (miniGameResult !== 'playing') return
        tapCountRef.current += 1
        const newTaps = tapCountRef.current
        setMiniGameData((prev: any) => ({ ...prev, taps: newTaps }))
        if (newTaps >= 10) {
            finishMiniGame(true)
        }
    }, [miniGameResult, finishMiniGame])

    // Quick Tap timer
    useEffect(() => {
        if (miniGameType !== 'quick_tap' || !miniGameOpen || miniGameResult !== 'playing') return
        tapTimerRef.current = setInterval(() => {
            setMiniGameData((prev: any) => {
                const newTime = prev.timeLeft - 0.1
                if (newTime <= 0) {
                    finishMiniGame(false)
                    return { ...prev, timeLeft: 0, active: false }
                }
                return { ...prev, timeLeft: Math.round(newTime * 10) / 10 }
            })
        }, 100)
        return () => { if (tapTimerRef.current) clearInterval(tapTimerRef.current) }
    }, [miniGameType, miniGameOpen, miniGameResult, finishMiniGame])

    const handleScavenge = () => {
        setResult(null)
        startMiniGame()
    }

    const currentLoc = LOCATIONS[player.currentLocation as LocationId]
    const xpNeeded = scavengeXpForLevel(player.scavengeLevel + 1)
    const xpProgress = Math.min((player.scavengeXp / xpNeeded) * 100, 100)
    const streakLocation = player.scavengeStreakLocation === player.currentLocation
    const currentStreak = streakLocation ? player.scavengeStreak : 0
    const streakBonus = getStreakBonus(currentStreak)
    const energyCost = doubleMode ? DOUBLE_ENERGY_COST : SCAVENGE_ENERGY_COST
    const spots = SCAVENGE_SPOTS[player.currentLocation as LocationId] ?? []

    const lootChances = useMemo(() =>
        getScavengeChances(player.currentLocation as LocationId, player.scavengeLevel),
        [player.currentLocation, player.scavengeLevel]
    )

    return (
        <div className="space-y-6">
            {/* ── Top Stats Row ── */}
            <ScavengeStats
                scavengeLevel={player.scavengeLevel}
                scavengeXp={player.scavengeXp}
                xpNeeded={xpNeeded}
                xpProgress={xpProgress}
                currentStreak={currentStreak}
                streakBonus={streakBonus}
                equippedTool={player.equippedTool}
                t={t}
            />

            {/* Level up alert */}
            {result?.leveledUp && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <TrendingUpIcon className="size-4 text-yellow-500" />
                    <AlertTitle>{t('scavenge.levelUp')}</AlertTitle>
                    <AlertDescription>
                        {t('scavenge.levelUpDesc', { level: String(result.newLevel) })}
                    </AlertDescription>
                </Alert>
            )}

            {/* ── Mini-Game Dialog ── */}
            <ScavengeMiniGame
                open={miniGameOpen}
                onOpenChange={setMiniGameOpen}
                miniGameType={miniGameType}
                miniGameResult={miniGameResult}
                miniGameData={miniGameData}
                onPickTrash={handlePickTrash}
                onGuessDirection={handleGuessDirection}
                onQuickTap={handleQuickTap}
            />

            {/* ── Loading + Result Dialogs ── */}
            <ScavengeDialogs
                loadingOpen={loadingOpen}
                onLoadingChange={setLoadingOpen}
                resultOpen={resultOpen}
                onResultChange={setResultOpen}
                result={result}
                t={t}
            />

            {/* ── Main Action Card ── */}
            <Card className="relative overflow-hidden border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                <CardHeader className="relative flex items-center gap-2">
                    <MapPinIcon className="size-5 text-primary" />
                    {t('scavenge.title', { location: currentLoc ? t(`loc.${player.currentLocation}`) : t('unknown') })}
                    <CardDescription>{t('scavenge.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                    {/* Spot Selection */}
                    <SpotSelector
                        spots={spots}
                        selectedSpotId={selectedSpotId}
                        onSelectSpot={setSelectedSpotId}
                    />

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-1">
                        <button
                            onClick={() => setDoubleMode(false)}
                            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${!doubleMode ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <div className="flex items-center justify-center gap-1.5">
                                <ZapIcon className="size-3.5" />
                                {t('scavenge.normalMode')}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{SCAVENGE_ENERGY_COST} Energy</div>
                        </button>
                        <button
                            onClick={() => setDoubleMode(true)}
                            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${doubleMode ? 'bg-background shadow-sm ring-1 ring-amber-500/30' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <div className="flex items-center justify-center gap-1.5">
                                <ZapIcon className="size-3.5 text-amber-500" />
                                <ZapIcon className="size-3.5 text-amber-500 -ml-2.5" />
                                {t('scavenge.doubleMode')}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{DOUBLE_ENERGY_COST} Energy</div>
                        </button>
                    </div>

                    {/* Search Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border p-4">
                        <div>
                            <p className="font-semibold">{t('scavenge.searchArea')}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    <ZapIcon className="size-3 text-orange-400 mr-1" />
                                    {t('scavenge.doubleCost', { cost: String(energyCost) })}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {t('scavenge.youHave', { energy: String(player.energy) })}
                                </span>
                            </div>
                        </div>
                        <Button
                            onClick={handleScavenge}
                            disabled={isPending || player.energy < energyCost}
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            <SearchIcon className="mr-2 size-4" />
                            {isPending ? t('scavenge.searching') : t('scavenge.searchNow')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── Tabs Section ── */}
            <Tabs defaultValue="chances" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="chances" className="text-xs">
                        <ArchiveIcon className="size-3 mr-1" />
                        Loot
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="text-xs">
                        <ScrollTextIcon className="size-3 mr-1" />
                        Log
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="chances">
                    <LootChances lootChances={lootChances} t={t} />
                </TabsContent>

                <TabsContent value="logs">
                    <ScavengeLog logs={logs} t={t} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
