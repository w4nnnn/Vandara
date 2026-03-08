'use client'

import { Badge } from '@/components/ui/badge'

type CombatBonus = {
    attack?: number
    defense?: number
    speed?: number
    dexterity?: number
    maxHp?: number
}

export function CombatBonuses({ bonus }: { bonus: CombatBonus }) {
    return (
        <div className="flex gap-1 flex-wrap">
            {bonus.attack && <Badge variant="outline" className="text-[10px] text-red-500">+{bonus.attack} ATK</Badge>}
            {bonus.defense && <Badge variant="outline" className="text-[10px] text-blue-500">+{bonus.defense} DEF</Badge>}
            {bonus.speed && <Badge variant="outline" className="text-[10px] text-green-500">+{bonus.speed} SPD</Badge>}
            {bonus.dexterity && <Badge variant="outline" className="text-[10px] text-purple-500">+{bonus.dexterity} DEX</Badge>}
            {bonus.maxHp && <Badge variant="outline" className="text-[10px] text-pink-500">+{bonus.maxHp} HP</Badge>}
        </div>
    )
}
