'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    SwordsIcon, ShieldIcon, GemIcon, UsersIcon,
} from 'lucide-react'
import { ITEMS, RARITY_COLORS } from '@/lib/game/constants'
import AvatarComponent from '@/lib/avataaars'
import type { ActiveNpc } from '@/lib/game/npc-generator'

type NpcListProps = {
    npcs: ActiveNpc[]
    isPending: boolean
    onSelectNpc: (npcId: string) => void
    t: (key: string) => string
}

export function NpcList({ npcs, isPending, onSelectNpc, t }: NpcListProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UsersIcon className="size-5" />
                            {t('npc.nearby')}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {t('npc.nearbyDesc')}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {npcs.map((npc) => {
                        const msLeft = Math.max(0, npc.nextRotationTime - Date.now())
                        const minutes = Math.floor(msLeft / 60000)
                        const seconds = Math.floor((msLeft % 60000) / 1000)

                        return (
                            <div
                                key={npc.id}
                                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between hover:border-primary/50"
                            >
                                <div className="flex flex-1 items-center gap-4">
                                    <div className="flex shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden size-14 border">
                                        <AvatarComponent
                                            avatarStyle="Circle"
                                            {...(npc.avatar as any)}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{npc.label}</h3>
                                            <Badge variant="outline" className="text-xs">
                                                Lv.{npc.level}
                                            </Badge>
                                            <Badge variant="secondary" className="text-[10px] ml-auto sm:ml-2">
                                                Reset: {minutes}m {seconds}s
                                            </Badge>
                                        </div>
                                        {(npc.equipment.weapon || npc.equipment.armor || npc.equipment.accessory) && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {npc.equipment.weapon && (
                                                    <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30 bg-red-500/5">
                                                        <SwordsIcon className="size-2.5 mr-1" />
                                                        {ITEMS[npc.equipment.weapon]?.label ?? npc.equipment.weapon}
                                                    </Badge>
                                                )}
                                                {npc.equipment.armor && (
                                                    <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-500/30 bg-blue-500/5">
                                                        <ShieldIcon className="size-2.5 mr-1" />
                                                        {ITEMS[npc.equipment.armor]?.label ?? npc.equipment.armor}
                                                    </Badge>
                                                )}
                                                {npc.equipment.accessory && (
                                                    <Badge variant="outline" className="text-[10px] text-purple-500 border-purple-500/30 bg-purple-500/5">
                                                        <GemIcon className="size-2.5 mr-1" />
                                                        {ITEMS[npc.equipment.accessory]?.label ?? npc.equipment.accessory}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-sm text-muted-foreground">{npc.description}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="default"
                                    size="sm"
                                    disabled={isPending}
                                    onClick={() => onSelectNpc(npc.id)}
                                    className="shrink-0"
                                >
                                    {t('npc.meet')}
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
