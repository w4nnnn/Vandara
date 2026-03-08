'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HammerIcon, SwordIcon, ShieldIcon, FlaskConicalIcon, WrenchIcon, RecycleIcon, ChevronRightIcon } from 'lucide-react'
import { craftItem } from '@/app/actions/crafting'
import { recycle } from '@/app/actions/recycle'
import { CRAFTING_RECIPES, RECYCLE_RECIPES, ITEMS, RARITY_COLORS, RARITY_BG } from '@/lib/game/constants'
import { useTranslation } from '@/lib/i18n'
import { CombatBonuses } from '@/components/game/combat-bonuses'

type PlayerItem = { id: number; itemId: string; quantity: number }

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    weapon: SwordIcon, armor: ShieldIcon, consumable: FlaskConicalIcon, tool: WrenchIcon,
}

export default function CraftingContent({ player, playerItems }: { player: any; playerItems: PlayerItem[] }) {
    const router = useRouter()
    const { t } = useTranslation()
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

    const handleRecycle = (recipeId: string) => {
        setResult(null)
        startTransition(async () => {
            const res = await recycle(recipeId)
            if (res.error) setResult(res.error)
            else {
                const def = ITEMS[res.outputItemId!]
                setResult(`Berhasil mendaur ulang! Dapat: ${res.outputQuantity}x ${def?.label ?? res.outputItemId}`)
            }
            router.refresh()
        })
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="crafting" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="crafting" className="text-xs">
                        <HammerIcon className="size-4 mr-2" />
                        Crafting
                    </TabsTrigger>
                    <TabsTrigger value="recycle" className="text-xs">
                        <RecycleIcon className="size-4 mr-2" />
                        Daur Ulang
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="crafting">
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
                        <CardHeader className="relative">
                            <CardTitle className="flex items-center gap-2">
                                <HammerIcon className="size-5 text-orange-500" />
                                Crafting
                            </CardTitle>
                            <CardDescription>Gabungkan material untuk membuat pelengkapan dan konsumabel.</CardDescription>
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
                                        {outDef?.combatBonus && <CombatBonuses bonus={outDef.combatBonus} />}
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
                </TabsContent>

                <TabsContent value="recycle">
                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                        <CardHeader className="relative">
                            <CardTitle className="flex items-center gap-2">
                                <RecycleIcon className="size-5 text-green-500" />
                                Daur Ulang
                            </CardTitle>
                            <CardDescription>Ubah sampah hasil pulungan menjadi material berguna.</CardDescription>
                        </CardHeader>
                        <CardContent className="relative space-y-3">
                            {result && (
                                <div className={`text-sm text-center p-2 rounded-lg ${result.includes('Berhasil') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {result}
                                </div>
                            )}

                            {RECYCLE_RECIPES.map(recipe => {
                                const outDef = ITEMS[recipe.output.itemId]
                                const locked = player.scavengeLevel < recipe.scavengeLevelRequired
                                const hasAll = recipe.inputs.every(inp => (invMap.get(inp.itemId) ?? 0) >= inp.quantity)

                                return (
                                    <div key={recipe.id} className={`rounded-lg border p-4 space-y-3 ${locked ? 'opacity-50' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <ChevronRightIcon className="size-4 text-green-500" />
                                                <span className="font-semibold text-sm">
                                                    {recipe.output.quantity > 1 ? `${recipe.output.quantity}x ` : ''}
                                                    {t(`item.${recipe.output.itemId}`)}
                                                </span>
                                                {outDef && (
                                                    <Badge variant="outline" className={`text-[10px] ${RARITY_COLORS[outDef.rarity]}`}>
                                                        {outDef.rarity}
                                                    </Badge>
                                                )}
                                            </div>
                                            {locked ? (
                                                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                                    Scav.{recipe.scavengeLevelRequired}
                                                </Badge>
                                            ) : (
                                                <Button size="sm" variant="outline" disabled={isPending || !hasAll} onClick={() => handleRecycle(recipe.id)}>
                                                    Daur
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
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
