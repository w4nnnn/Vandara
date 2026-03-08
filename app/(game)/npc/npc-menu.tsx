'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    SwordsIcon, ShieldIcon, ZapIcon, TargetIcon,
    HeartIcon, CoinsIcon, StarIcon, ActivityIcon,
    MessageCircleIcon, FootprintsIcon, ArrowLeftIcon,
    GemIcon,
} from 'lucide-react'
import { ITEMS, RARITY_COLORS } from '@/lib/game/constants'
import type { ActiveNpc } from '@/lib/game/npc-generator'

type NpcMenuProps = {
    npc: ActiveNpc
    isPending: boolean
    isPickpocketing: boolean
    isHospitalized: boolean
    playerHealth: number
    onBack: () => void
    onChat: () => void
    onPickpocket: () => void
    onFight: () => void
    t: (key: string) => string
}

export function NpcMenu({
    npc,
    isPending,
    isPickpocketing,
    isHospitalized,
    playerHealth,
    onBack,
    onChat,
    onPickpocket,
    onFight,
    t,
}: NpcMenuProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="size-8" onClick={onBack}>
                        <ArrowLeftIcon className="size-4" />
                    </Button>
                    <div>
                        <CardTitle className="text-base">{npc.label}</CardTitle>
                        <CardDescription>{npc.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* NPC Stats */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <SwordsIcon className="size-3" /> STR {npc.strength}
                    </span>
                    <span className="flex items-center gap-1">
                        <ShieldIcon className="size-3" /> DEF {npc.defense}
                    </span>
                    <span className="flex items-center gap-1">
                        <ZapIcon className="size-3" /> SPD {npc.speed}
                    </span>
                    <span className="flex items-center gap-1">
                        <TargetIcon className="size-3" /> DEX {npc.dexterity}
                    </span>
                    <span className="flex items-center gap-1">
                        <HeartIcon className="size-3" /> HP {npc.maxHealth}
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-3 text-xs">
                    <span className="flex items-center gap-1 text-green-600"><CoinsIcon className="h-4 w-4" /> ${npc.moneyDrop[0]}–${npc.moneyDrop[1]}</span>
                    <span className="flex items-center gap-1 text-blue-600"><StarIcon className="h-4 w-4" /> {npc.xpDrop} XP</span>
                    <span className="flex items-center gap-1 text-orange-600"><ActivityIcon className="h-4 w-4" /> {npc.nerveCost} nerve</span>
                </div>

                {/* Equipment section */}
                {(npc.equipment.weapon || npc.equipment.armor || npc.equipment.accessory) && (
                    <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
                        <p className="text-xs font-semibold text-muted-foreground">PERLENGKAPAN</p>
                        <div className="flex flex-wrap gap-2">
                            {npc.equipment.weapon && (() => {
                                const def = ITEMS[npc.equipment.weapon!]
                                return (
                                    <div className="flex items-center gap-1.5">
                                        <SwordsIcon className="size-3.5 text-red-500" />
                                        <span className="text-xs font-medium">{def?.label ?? npc.equipment.weapon}</span>
                                        {def && <Badge variant="outline" className={`text-[9px] ${RARITY_COLORS[def.rarity]}`}>{def.rarity}</Badge>}
                                    </div>
                                )
                            })()}
                            {npc.equipment.armor && (() => {
                                const def = ITEMS[npc.equipment.armor!]
                                return (
                                    <div className="flex items-center gap-1.5">
                                        <ShieldIcon className="size-3.5 text-blue-500" />
                                        <span className="text-xs font-medium">{def?.label ?? npc.equipment.armor}</span>
                                        {def && <Badge variant="outline" className={`text-[9px] ${RARITY_COLORS[def.rarity]}`}>{def.rarity}</Badge>}
                                    </div>
                                )
                            })()}
                            {npc.equipment.accessory && (() => {
                                const def = ITEMS[npc.equipment.accessory!]
                                return (
                                    <div className="flex items-center gap-1.5">
                                        <GemIcon className="size-3.5 text-purple-500" />
                                        <span className="text-xs font-medium">{def?.label ?? npc.equipment.accessory}</span>
                                        {def && <Badge variant="outline" className={`text-[9px] ${RARITY_COLORS[def.rarity]}`}>{def.rarity}</Badge>}
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        variant="outline"
                        className="flex flex-col gap-1 h-auto py-4"
                        onClick={onChat}
                        disabled={isPickpocketing}
                    >
                        <MessageCircleIcon className="size-5" />
                        <span className="text-xs font-medium">{t('npc.chat')}</span>
                        <span className="text-[9px] text-muted-foreground">{t('npc.talkTo')}</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex flex-col gap-1 h-auto py-4"
                        onClick={onPickpocket}
                        disabled={isPickpocketing || isHospitalized || playerHealth <= 0}
                    >
                        <FootprintsIcon className="size-5" />
                        <span className="text-xs font-medium">Copet</span>
                        <span className="text-[9px] text-muted-foreground">-3 nerve</span>
                    </Button>
                    <Button
                        variant="default"
                        className="flex flex-col gap-1 h-auto py-4"
                        disabled={isPending || isPickpocketing || isHospitalized || playerHealth <= 0}
                        onClick={onFight}
                    >
                        <SwordsIcon className="size-5" />
                        <span className="text-xs font-medium">{t('npc.challenge')}</span>
                        <span className="text-[9px] opacity-70">{t('npc.fightWith')}</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
