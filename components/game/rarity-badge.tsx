'use client'

import { Badge } from '@/components/ui/badge'
import { RARITY_COLORS, type ItemRarity } from '@/lib/game/constants'

export function RarityBadge({ rarity, label }: { rarity: ItemRarity; label?: string }) {
    return (
        <Badge variant="outline" className={`text-[10px] ${RARITY_COLORS[rarity]}`}>
            {label ?? rarity}
        </Badge>
    )
}
