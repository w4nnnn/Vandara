'use client'

import { Badge } from '@/components/ui/badge'

type ToolEffect = {
    nothingReduction?: number
    materialBonus?: number
    moneyBonus?: number
    rareBonus?: number
}

export function ToolEffects({ effect }: { effect: ToolEffect }) {
    return (
        <div className="flex gap-1 flex-wrap">
            {effect.nothingReduction && <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-500 border-orange-500/20">-{effect.nothingReduction}% Kosong</Badge>}
            {effect.materialBonus && <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">+{effect.materialBonus}% Material</Badge>}
            {effect.moneyBonus && <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">x{effect.moneyBonus} Uang</Badge>}
            {effect.rareBonus && <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-500 border-indigo-500/20">+{effect.rareBonus}% Rare</Badge>}
        </div>
    )
}
