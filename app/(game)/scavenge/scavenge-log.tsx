'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FlameIcon, ScrollTextIcon, SparklesIcon, ArchiveIcon, ShieldAlertIcon, UserIcon } from 'lucide-react'
import { ITEMS } from '@/lib/game/constants'
import { RarityBadge } from '@/components/game/rarity-badge'

const EVENT_ICONS: Record<string, React.ElementType> = {
    crit: SparklesIcon,
    treasure_chest: ArchiveIcon,
    danger: ShieldAlertIcon,
    npc_trade: UserIcon,
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

type ScavengeLogProps = {
    logs: LogEntry[]
    t: (key: string, params?: Record<string, string>) => string
}

export function ScavengeLog({ logs, t }: ScavengeLogProps) {
    return (
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
                                        {itemDef && <RarityBadge rarity={itemDef.rarity} label={t(`rarity.${itemDef.rarity}`)} />}
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
    )
}
