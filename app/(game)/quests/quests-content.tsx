'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollTextIcon, GiftIcon, CheckCircleIcon, ClockIcon } from 'lucide-react'
import { claimQuestReward } from '@/app/actions/quests'
import { DAILY_QUESTS } from '@/lib/game/constants'

type Quest = { id: number; questId: string; progress: number; completed: boolean; claimed: boolean }

export default function QuestsContent({ player, quests }: { player: any; quests: Quest[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleClaim = (questRowId: number) => {
        startTransition(async () => {
            await claimQuestReward(questRowId)
            router.refresh()
        })
    }

    return (
        <div className="space-y-6">
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2">
                        <ScrollTextIcon className="size-5 text-amber-500" />
                        Misi Harian
                    </CardTitle>
                    <CardDescription>Selesaikan misi untuk mendapatkan hadiah. Reset setiap hari.</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3">
                    {quests.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Belum ada misi hari ini.</p>
                    ) : (
                        quests.map(pq => {
                            const def = DAILY_QUESTS.find(q => q.id === pq.questId)
                            if (!def) return null
                            const pct = Math.min((pq.progress / def.target) * 100, 100)

                            return (
                                <div key={pq.id} className={`rounded-lg border p-4 space-y-3 ${pq.claimed ? 'opacity-50' : pq.completed ? 'border-green-500/50 bg-green-500/5' : ''}`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {pq.claimed ? (
                                                    <CheckCircleIcon className="size-4 text-green-500" />
                                                ) : pq.completed ? (
                                                    <GiftIcon className="size-4 text-amber-500 animate-pulse" />
                                                ) : (
                                                    <ClockIcon className="size-4 text-muted-foreground" />
                                                )}
                                                <span className="font-semibold text-sm">{def.label}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{def.description}</p>
                                        </div>
                                        {pq.completed && !pq.claimed && (
                                            <Button size="sm" onClick={() => handleClaim(pq.id)} disabled={isPending}>
                                                <GiftIcon className="size-3 mr-1" /> Klaim
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Progress value={pct} className="h-2 flex-1" />
                                        <span className="text-xs font-mono w-12 text-end">{pq.progress}/{def.target}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {def.rewards.money && (
                                            <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">+${def.rewards.money}</Badge>
                                        )}
                                        {def.rewards.xp && (
                                            <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-500/30">+{def.rewards.xp} XP</Badge>
                                        )}
                                        {def.rewards.itemId && (
                                            <Badge variant="outline" className="text-[10px] text-purple-500 border-purple-500/30">{def.rewards.itemQty ?? 1}x Item</Badge>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
