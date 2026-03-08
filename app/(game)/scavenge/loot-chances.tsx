'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArchiveIcon } from 'lucide-react'
import { ITEMS, RARITY_BG } from '@/lib/game/constants'
import { RarityBadge } from '@/components/game/rarity-badge'

type LootEntry = {
    entry: {
        id: string
        type: string
        itemId?: string
        moneyMin?: number
        moneyMax?: number
    }
    chance: number
}

type LootChancesProps = {
    lootChances: LootEntry[]
    t: (key: string, params?: Record<string, string>) => string
}

export function LootChances({ lootChances, t }: LootChancesProps) {
    return (
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
                                    {itemDef && <RarityBadge rarity={itemDef.rarity} label={t(`rarity.${itemDef.rarity}`)} />}
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
    )
}
