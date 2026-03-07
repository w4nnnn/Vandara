'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HammerIcon, SwordIcon, ShieldIcon, FlaskConicalIcon, WrenchIcon } from 'lucide-react'
import { craftItem } from '@/app/actions/crafting'
import { CRAFTING_RECIPES, ITEMS, RARITY_COLORS, RARITY_BG } from '@/lib/game/constants'

type PlayerItem = { id: number; itemId: string; quantity: number }

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    weapon: SwordIcon, armor: ShieldIcon, consumable: FlaskConicalIcon, tool: WrenchIcon,
}

export default function CraftingContent({ player, playerItems }: { player: any; playerItems: PlayerItem[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<string | null>(null)

    const invMap = new Map(playerItems.map(pi => [pi.itemId, pi.quantity]))

    const handleCraft = (recipeId: string) => {
        setResult(null)
        startTransition(async () => {
            const res = await craftItem(recipeId)
            if (res.error) setResult(res.error)
            else {
                const def = ITEMS[res.outputItemId!]
                setResult(`Berhasil membuat ${def?.label ?? res.outputItemId}!`)
            }
            router.refresh()
        })
    }

    return (
        <div className="space-y-6">
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                        <HammerIcon className="size-5 text-orange-500" />
                        Crafting
                    </CardTitle>
                    <CardDescription>Gabungkan material untuk membuat senjata, armor, dan konsumabel.</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3">
                    {result && (
                        <div className={`text-sm text-center p-2 rounded-lg ${result.includes('Berhasil') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {result}
                        </div>
                    )}

                    {CRAFTING_RECIPES.map(recipe => {
                        const outDef = ITEMS[recipe.output.itemId]
                        const CatIcon = CATEGORY_ICONS[recipe.category] ?? HammerIcon
                        const locked = player.level < recipe.levelRequired || player.scavengeLevel < recipe.scavengeLevelRequired
                        const hasAll = recipe.inputs.every(inp => (invMap.get(inp.itemId) ?? 0) >= inp.quantity)

                        return (
                            <div key={recipe.id} className={`rounded-lg border p-4 space-y-3 ${locked ? 'opacity-50' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CatIcon className="size-4 text-orange-500" />
                                        <span className="font-semibold text-sm">
                                            {recipe.output.quantity > 1 ? `${recipe.output.quantity}x ` : ''}
                                            {outDef?.label ?? recipe.output.itemId}
                                        </span>
                                        {outDef && (
                                            <Badge variant="outline" className={`text-[10px] ${RARITY_COLORS[outDef.rarity]}`}>
                                                {outDef.rarity}
                                            </Badge>
                                        )}
                                    </div>
                                    {locked ? (
                                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                            Lv.{recipe.levelRequired} / Scav.{recipe.scavengeLevelRequired}
                                        </Badge>
                                    ) : (
                                        <Button size="sm" disabled={isPending || !hasAll} onClick={() => handleCraft(recipe.id)}>
                                            <HammerIcon className="size-3 mr-1" /> Craft
                                        </Button>
                                    )}
                                </div>
                                {outDef?.description && (
                                    <p className="text-xs text-muted-foreground">{outDef.description}</p>
                                )}
                                {outDef?.combatBonus && (
                                    <div className="flex gap-1.5 flex-wrap">
                                        {outDef.combatBonus.attack && <Badge variant="outline" className="text-[10px] text-red-500">+{outDef.combatBonus.attack} ATK</Badge>}
                                        {outDef.combatBonus.defense && <Badge variant="outline" className="text-[10px] text-blue-500">+{outDef.combatBonus.defense} DEF</Badge>}
                                        {outDef.combatBonus.speed && <Badge variant="outline" className="text-[10px] text-green-500">+{outDef.combatBonus.speed} SPD</Badge>}
                                        {outDef.combatBonus.dexterity && <Badge variant="outline" className="text-[10px] text-purple-500">+{outDef.combatBonus.dexterity} DEX</Badge>}
                                        {outDef.combatBonus.maxHp && <Badge variant="outline" className="text-[10px] text-pink-500">+{outDef.combatBonus.maxHp} HP</Badge>}
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-1.5">
                                    {recipe.inputs.map((inp, i) => {
                                        const owned = invMap.get(inp.itemId) ?? 0
                                        const enough = owned >= inp.quantity
                                        const inputDef = ITEMS[inp.itemId]
                                        return (
                                            <Badge key={i} variant="outline"
                                                className={`text-[10px] ${enough ? 'border-green-500/30 text-green-600' : 'border-red-500/30 text-red-500'}`}>
                                                {inputDef?.label ?? inp.itemId} {owned}/{inp.quantity}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}
