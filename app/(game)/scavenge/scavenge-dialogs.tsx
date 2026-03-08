'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { SearchIcon, SparklesIcon, ArchiveIcon, ShieldAlertIcon, UserIcon, FlameIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { ITEMS, RARITY_COLORS, RARITY_BG, type ItemRarity } from '@/lib/game/constants'
import { RarityBadge } from '@/components/game/rarity-badge'

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

type ScavengeResult = {
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
}

type ScavengeDialogsProps = {
    loadingOpen: boolean
    onLoadingChange: (open: boolean) => void
    resultOpen: boolean
    onResultChange: (open: boolean) => void
    result: ScavengeResult | null
    t: (key: string, params?: Record<string, string>) => string
}

export function ScavengeDialogs({
    loadingOpen,
    onLoadingChange,
    resultOpen,
    onResultChange,
    result,
    t,
}: ScavengeDialogsProps) {
    return (
        <>
            {/* Loading Dialog */}
            <Dialog open={loadingOpen} onOpenChange={onLoadingChange}>
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

            {/* Result Dialog */}
            <Dialog open={resultOpen} onOpenChange={onResultChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            {result?.error ? t('scavenge.failed') : t('scavenge.lootFound')}
                        </DialogTitle>
                        {result?.spotLabel && (
                            <p className="text-center text-xs text-muted-foreground">
                                Ditemukan di: <span className="font-semibold">{result.spotLabel}</span>
                            </p>
                        )}
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
                                                        {def && <RarityBadge rarity={def.rarity} label={t(`rarity.${def.rarity}`)} />}
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
                        <Button onClick={() => onResultChange(false)} className="w-full">{t('close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
