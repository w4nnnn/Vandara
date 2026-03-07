'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    SearchIcon, MapPinIcon, ZapIcon, ArchiveIcon, StarIcon, TrendingUpIcon,
    FlameIcon, WrenchIcon, RecycleIcon, ScrollTextIcon, ShieldAlertIcon,
    SparklesIcon, UserIcon, ChevronRightIcon,
} from 'lucide-react'
import { scavenge, equipTool } from '@/app/actions/scavenge'
import { recycle } from '@/app/actions/recycle'
import {
    LOCATIONS, ITEMS, type LocationId,
    getScavengeChances, scavengeXpForLevel,
    SCAVENGE_ENERGY_COST, DOUBLE_ENERGY_COST,
    SCAVENGE_TOOL_IDS, RECYCLE_RECIPES,
    RARITY_COLORS, RARITY_BG,
    getStreakBonus,
    type ItemRarity,
} from '@/lib/game/constants'
import { useTranslation } from '@/lib/i18n'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

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

const EVENT_ICONS: Record<string, React.ElementType> = {
    crit: SparklesIcon,
    treasure_chest: ArchiveIcon,
    danger: ShieldAlertIcon,
    npc_trade: UserIcon,
}

const EVENT_COLORS: Record<string, string> = {
    crit: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    treasure_chest: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    danger: 'text-red-500 bg-red-500/10 border-red-500/30',
    npc_trade: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
}

function RarityBadge({ rarity, t }: { rarity: ItemRarity; t: (k: string) => string }) {
    return (
        <Badge variant="outline" className={`text-[10px] ${RARITY_COLORS[rarity]}`}>
            {t(`rarity.${rarity}`)}
        </Badge>
    )
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
    } | null>(null)
    const [loadingOpen, setLoadingOpen] = useState(false)
    const [resultOpen, setResultOpen] = useState(false)
    const [doubleMode, setDoubleMode] = useState(false)

    const handleScavenge = () => {
        setResult(null)
        setLoadingOpen(true)
        startTransition(async () => {
            const res = await scavenge(doubleMode)
            setResult(res)
            setLoadingOpen(false)
            setResultOpen(true)
            router.refresh()
        })
    }

    const handleEquipTool = (toolId: string | null) => {
        startTransition(async () => {
            await equipTool(toolId)
            router.refresh()
        })
    }

    const handleRecycle = (recipeId: string) => {
        startTransition(async () => {
            await recycle(recipeId)
            router.refresh()
        })
    }

    const currentLoc = LOCATIONS[player.currentLocation as LocationId]
    const xpNeeded = scavengeXpForLevel(player.scavengeLevel + 1)
    const xpProgress = Math.min((player.scavengeXp / xpNeeded) * 100, 100)
    const streakLocation = player.scavengeStreakLocation === player.currentLocation
    const currentStreak = streakLocation ? player.scavengeStreak : 0
    const streakBonus = getStreakBonus(currentStreak)
    const energyCost = doubleMode ? DOUBLE_ENERGY_COST : SCAVENGE_ENERGY_COST

    const lootChances = useMemo(() =>
        getScavengeChances(player.currentLocation as LocationId, player.scavengeLevel),
        [player.currentLocation, player.scavengeLevel]
    )

    // Player's tool items
    const ownedTools = pItems.filter(pi => SCAVENGE_TOOL_IDS.includes(pi.itemId as typeof SCAVENGE_TOOL_IDS[number]))
    const equippedDef = player.equippedTool ? ITEMS[player.equippedTool] : null

    // Inventory map for recipe checking
    const invMap = new Map(pItems.map(pi => [pi.itemId, pi.quantity]))

    return (
        <div className="space-y-6">
            {/* ── Top Stats Row ── */}
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
                            <span className="text-2xl font-bold">{player.scavengeLevel}</span>
                            <span className="text-xs text-muted-foreground">
                                {player.scavengeXp}/{xpNeeded} XP
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
                                    <RarityBadge rarity={equippedDef.rarity} t={t} />
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => handleEquipTool(null)} disabled={isPending}>
                                    {t('scavenge.unequipTool')}
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('scavenge.noTool')}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

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

            {/* ── Loading Dialog ── */}
            <Dialog open={loadingOpen} onOpenChange={setLoadingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('scavenge.searching')}</DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                <div className="relative rounded-full bg-primary/10 p-4">
                                    <SearchIcon className="size-8 text-primary animate-pulse" />
                                </div>
                            </div>
                            <Spinner className="size-5" />
                        </div>
                    </DialogDescription>
                </DialogContent>
            </Dialog>

            {/* ── Result Dialog ── */}
            <Dialog open={resultOpen} onOpenChange={setResultOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            {result?.error ? t('scavenge.failed') : t('scavenge.lootFound')}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="space-y-4">
                            {result?.error && (
                                <div className="text-center text-destructive">{result.error}</div>
                            )}

                            {/* Event Banner */}
                            {result?.event && (
                                <div className={`flex items-center gap-3 rounded-lg border p-3 ${EVENT_COLORS[result.event.type] ?? ''}`}>
                                    {(() => {
                                        const EvIcon = EVENT_ICONS[result.event.type] ?? SparklesIcon
                                        return <EvIcon className="size-5 shrink-0" />
                                    })()}
                                    <div>
                                        <div className="font-semibold text-sm">{t(`event.${result.event.type}`)}</div>
                                        <div className="text-xs opacity-80">
                                            {result.event.type === 'danger'
                                                ? t('event.danger.desc', { hp: String(result.healthLost ?? 0), energy: String(result.energyLost ?? 0) })
                                                : t(`event.${result.event.type}.desc`)
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Loot Result */}
                            {result?.success && result.loot && (
                                <div className="text-center space-y-2">
                                    {(() => {
                                        const itemId = result.loot.itemId
                                        const def = itemId ? ITEMS[itemId] : null
                                        const isMoney = result.loot.money !== undefined && result.loot.money > 0
                                        const isNothing = result.loot.money === 0 && !itemId

                                        return (
                                            <div className={`rounded-xl border-2 p-4 ${def ? `${RARITY_BG[def.rarity]} ${RARITY_COLORS[def.rarity]}` : isNothing ? 'bg-muted/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                                {isNothing ? (
                                                    <div className="text-muted-foreground">{t('scavenge.nothing')}</div>
                                                ) : isMoney ? (
                                                    <div className="text-green-500 text-xl font-bold">${result.loot.money}</div>
                                                ) : (
                                                    <div>
                                                        <div className="text-lg font-bold">
                                                            {result.loot.quantity && result.loot.quantity > 1 ? `${result.loot.quantity}x ` : ''}
                                                            {t(`item.${itemId}`)}
                                                        </div>
                                                        {def && <RarityBadge rarity={def.rarity} t={t} />}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}

                            {/* XP footer */}
                            {result?.success && (
                                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                    <span>+{result.xpGained} XP {t('scavenge.xpLabel')}</span>
                                    {result.streak && result.streak > 1 && (
                                        <span className="flex items-center gap-1">
                                            <FlameIcon className="size-3 text-orange-500" />
                                            Streak {result.streak}x
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Button onClick={() => setResultOpen(false)} className="w-full">{t('close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Main Action Card ── */}
            <Card className="relative overflow-hidden border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                        <MapPinIcon className="size-5 text-primary" />
                        {t('scavenge.title', { location: currentLoc ? t(`loc.${player.currentLocation}`) : t('unknown') })}
                    </CardTitle>
                    <CardDescription>{t('scavenge.desc')}</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
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
                <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="chances" className="text-xs">
                        <ArchiveIcon className="size-3 mr-1" />
                        Loot
                    </TabsTrigger>
                    <TabsTrigger value="tools" className="text-xs">
                        <WrenchIcon className="size-3 mr-1" />
                        {t('scavenge.tools')}
                    </TabsTrigger>
                    <TabsTrigger value="recycle" className="text-xs">
                        <RecycleIcon className="size-3 mr-1" />
                        {t('scavenge.recycling')}
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="text-xs">
                        <ScrollTextIcon className="size-3 mr-1" />
                        Log
                    </TabsTrigger>
                </TabsList>

                {/* ── Loot Chances Tab ── */}
                <TabsContent value="chances">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <ArchiveIcon className="size-4 text-primary" />
                                {t('scavenge.lootChances')}
                            </CardTitle>
                            <CardDescription className="text-xs">{t('scavenge.lootChancesDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1.5">
                                {lootChances.map(({ entry, chance }) => {
                                    const itemDef = entry.itemId && entry.itemId !== 'junk' ? ITEMS[entry.itemId] : null
                                    let label: string
                                    if (entry.type === 'none') label = t('scavenge.nothing')
                                    else if (entry.type === 'money') label = t('scavenge.moneyDrop')
                                    else if (entry.itemId === 'junk') label = t('scavenge.junkLabel')
                                    else label = t(`item.${entry.itemId}`)

                                    return (
                                        <div key={entry.id} className={`flex items-center justify-between rounded-md border px-3 py-2 ${itemDef ? RARITY_BG[itemDef.rarity] : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{label}</span>
                                                {itemDef && <RarityBadge rarity={itemDef.rarity} t={t} />}
                                                {entry.type === 'money' && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        ${entry.moneyMin}–${entry.moneyMax}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Progress value={chance} className="h-1.5 w-16" />
                                                <span className="text-xs font-mono w-12 text-end">{chance}%</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Tools Tab ── */}
                <TabsContent value="tools">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <WrenchIcon className="size-4 text-blue-500" />
                                {t('scavenge.tools')}
                            </CardTitle>
                            <CardDescription className="text-xs">{t('scavenge.toolsDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {ownedTools.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    {t('scavenge.noTool')}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {ownedTools.map(pi => {
                                        const def = ITEMS[pi.itemId]
                                        if (!def) return null
                                        const isEquipped = player.equippedTool === pi.itemId
                                        return (
                                            <div key={pi.id} className={`flex items-center justify-between rounded-lg border p-3 ${isEquipped ? 'border-blue-500/50 bg-blue-500/5' : ''}`}>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <WrenchIcon className="size-4 text-muted-foreground" />
                                                        <span className="font-medium text-sm">{t(`item.${def.id}`)}</span>
                                                        <RarityBadge rarity={def.rarity} t={t} />
                                                        {isEquipped && <Badge className="text-[10px] bg-blue-500">Aktif</Badge>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{t(`item.${def.id}.desc`)}</p>
                                                    {def.toolEffect && (
                                                        <div className="flex gap-2 mt-1">
                                                            {def.toolEffect.nothingReduction && (
                                                                <Badge variant="outline" className="text-[10px]">-{def.toolEffect.nothingReduction}% Nothing</Badge>
                                                            )}
                                                            {def.toolEffect.materialBonus && (
                                                                <Badge variant="outline" className="text-[10px]">+{def.toolEffect.materialBonus}% Material</Badge>
                                                            )}
                                                            {def.toolEffect.moneyBonus && (
                                                                <Badge variant="outline" className="text-[10px]">x{def.toolEffect.moneyBonus} Money</Badge>
                                                            )}
                                                            {def.toolEffect.rareBonus && (
                                                                <Badge variant="outline" className="text-[10px]">+{def.toolEffect.rareBonus}% Rare</Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={isEquipped ? 'outline' : 'default'}
                                                    onClick={() => handleEquipTool(isEquipped ? null : pi.itemId)}
                                                    disabled={isPending}
                                                >
                                                    {isEquipped ? t('scavenge.unequipTool') : t('scavenge.equipTool')}
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Recycle Tab ── */}
                <TabsContent value="recycle">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <RecycleIcon className="size-4 text-green-500" />
                                {t('scavenge.recycling')}
                            </CardTitle>
                            <CardDescription className="text-xs">{t('scavenge.recyclingDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {RECYCLE_RECIPES.map(recipe => {
                                    const outDef = ITEMS[recipe.output.itemId]
                                    const locked = player.scavengeLevel < recipe.scavengeLevelRequired
                                    const hasAll = recipe.inputs.every(inp => (invMap.get(inp.itemId) ?? 0) >= inp.quantity)

                                    return (
                                        <div key={recipe.id} className={`rounded-lg border p-3 space-y-2 ${locked ? 'opacity-50' : ''}`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ChevronRightIcon className="size-4 text-green-500" />
                                                    <span className="font-medium text-sm">
                                                        {recipe.output.quantity > 1 ? `${recipe.output.quantity}x ` : ''}
                                                        {t(`item.${recipe.output.itemId}`)}
                                                    </span>
                                                    {outDef && <RarityBadge rarity={outDef.rarity} t={t} />}
                                                </div>
                                                {locked ? (
                                                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                                        {t('scavenge.recipeLocked', { level: String(recipe.scavengeLevelRequired) })}
                                                    </Badge>
                                                ) : (
                                                    <Button size="sm" disabled={isPending || !hasAll} onClick={() => handleRecycle(recipe.id)}>
                                                        {t('scavenge.craft')}
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {recipe.inputs.map((inp, i) => {
                                                    const owned = invMap.get(inp.itemId) ?? 0
                                                    const enough = owned >= inp.quantity
                                                    return (
                                                        <Badge
                                                            key={i}
                                                            variant="outline"
                                                            className={`text-[10px] ${enough ? 'border-green-500/30 text-green-600' : 'border-red-500/30 text-red-500'}`}
                                                        >
                                                            {t(`item.${inp.itemId}`)} {owned}/{inp.quantity}
                                                        </Badge>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Logs Tab ── */}
                <TabsContent value="logs">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <ScrollTextIcon className="size-4 text-muted-foreground" />
                                {t('scavenge.recentLogs')}
                            </CardTitle>
                            <CardDescription className="text-xs">{t('scavenge.logsDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {logs.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">{t('scavenge.noLogs')}</p>
                            ) : (
                                <div className="space-y-1">
                                    {logs.map(log => {
                                        const itemDef = log.itemId ? ITEMS[log.itemId] : null
                                        return (
                                            <div key={log.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    {log.eventType && (() => {
                                                        const EvIcon = EVENT_ICONS[log.eventType] ?? SparklesIcon
                                                        return <EvIcon className="size-3.5 text-yellow-500" />
                                                    })()}
                                                    <span>
                                                        {log.resultType === 'none'
                                                            ? t('scavenge.logNothing')
                                                            : log.resultType === 'money'
                                                                ? `$${log.moneyAmount}`
                                                                : `${log.quantity && log.quantity > 1 ? `${log.quantity}x ` : ''}${t(`item.${log.itemId}`)}`
                                                        }
                                                    </span>
                                                    {itemDef && <RarityBadge rarity={itemDef.rarity} t={t} />}
                                                    {log.doubleMode && (
                                                        <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">2x</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    {log.streak > 1 && (
                                                        <span className="flex items-center gap-0.5">
                                                            <FlameIcon className="size-3 text-orange-500" />
                                                            {log.streak}
                                                        </span>
                                                    )}
                                                    <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
