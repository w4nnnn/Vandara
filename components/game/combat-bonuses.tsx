'use client'

import { Badge } from '@/components/ui/badge'

type CombatBonus = {
    attack?: number
    defense?: number
    dexterity?: number
    constitution?: number
    intelligence?: number
    wisdom?: number
    charisma?: number
    luck?: number
    perception?: number
    maxHp?: number
}

export function CombatBonuses({ bonus }: { bonus: CombatBonus }) {
    return (
        <div className="flex gap-1 flex-wrap">
            {bonus.attack && <Badge variant="outline" className="text-[10px] text-red-500">+{bonus.attack} ATK</Badge>}
            {bonus.defense && <Badge variant="outline" className="text-[10px] text-blue-500">+{bonus.defense} DEF</Badge>}
            {bonus.dexterity && <Badge variant="outline" className="text-[10px] text-purple-500">+{bonus.dexterity} DEX</Badge>}
            {bonus.constitution && <Badge variant="outline" className="text-[10px] text-amber-500">+{bonus.constitution} CON</Badge>}
            {bonus.intelligence && <Badge variant="outline" className="text-[10px] text-cyan-500">+{bonus.intelligence} INT</Badge>}
            {bonus.wisdom && <Badge variant="outline" className="text-[10px] text-indigo-500">+{bonus.wisdom} WIS</Badge>}
            {bonus.charisma && <Badge variant="outline" className="text-[10px] text-pink-400">+{bonus.charisma} CHA</Badge>}
            {bonus.luck && <Badge variant="outline" className="text-[10px] text-yellow-500">+{bonus.luck} LCK</Badge>}
            {bonus.perception && <Badge variant="outline" className="text-[10px] text-emerald-500">+{bonus.perception} PER</Badge>}
            {bonus.maxHp && <Badge variant="outline" className="text-[10px] text-pink-500">+{bonus.maxHp} HP</Badge>}
        </div>
    )
}
