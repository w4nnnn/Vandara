'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    SwordsIcon, ShieldIcon, ShieldCheckIcon, FootprintsIcon,
} from 'lucide-react'
import { HealthBar } from '@/components/game/health-bar'

type TurnLogEntry = {
    round: number
    message: string
    playerDamage: number
    enemyDamage: number
}

type CombatArenaProps = {
    playerName: string
    playerHP: number
    playerMaxHP: number
    enemyLabel: string
    enemyHP: number
    enemyMaxHP: number
    round: number
    isDefending: boolean
    isPending: boolean
    turnLog: TurnLogEntry[]
    onAction: (action: 'attack' | 'heavy_attack' | 'defend' | 'flee') => void
    t: (key: string) => string
}

export function CombatArena({
    playerName,
    playerHP,
    playerMaxHP,
    enemyLabel,
    enemyHP,
    enemyMaxHP,
    round,
    isDefending,
    isPending,
    turnLog,
    onAction,
    t,
}: CombatArenaProps) {
    return (
        <>
            {/* Health bars */}
            <Card>
                <CardContent className="space-y-4 p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <p className="mb-2 text-xs text-muted-foreground font-medium">
                                {t('npc.you')}
                            </p>
                            <HealthBar
                                label={playerName}
                                current={playerHP}
                                max={playerMaxHP}
                                color="bg-green-500"
                            />
                        </div>
                        <div>
                            <p className="mb-2 text-xs text-muted-foreground font-medium">
                                {t('npc.enemy')}
                            </p>
                            <HealthBar
                                label={enemyLabel}
                                current={enemyHP}
                                max={enemyMaxHP}
                                color="bg-red-500"
                            />
                        </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                        {t('npc.round')} {round} {isDefending && <Badge variant="outline" className="ml-2 text-xs"><ShieldIcon className="mr-1 h-3 w-3" /> {t('npc.defend')}</Badge>}
                    </p>
                </CardContent>
            </Card>

            {/* Action buttons */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t('npc.chooseAction')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Button
                            onClick={() => onAction('attack')}
                            disabled={isPending}
                            variant="default"
                            className="flex flex-col gap-1 h-auto py-3"
                        >
                            <SwordsIcon className="size-5" />
                            <span className="text-xs">{t('npc.attack')}</span>
                            <span className="text-[10px] opacity-70">{t('npc.attackDesc')}</span>
                        </Button>
                        <Button
                            onClick={() => onAction('heavy_attack')}
                            disabled={isPending}
                            variant="default"
                            className="flex flex-col gap-1 h-auto py-3 bg-orange-600 hover:bg-orange-700"
                        >
                            <SwordsIcon className="size-5" />
                            <span className="text-xs">{t('npc.heavyAttack')}</span>
                            <span className="text-[10px] opacity-70">{t('npc.heavyAttackDesc')}</span>
                        </Button>
                        <Button
                            onClick={() => onAction('defend')}
                            disabled={isPending}
                            variant="secondary"
                            className="flex flex-col gap-1 h-auto py-3"
                        >
                            <ShieldCheckIcon className="size-5" />
                            <span className="text-xs">{t('npc.defend')}</span>
                            <span className="text-[10px] opacity-70">{t('npc.defendDesc')}</span>
                        </Button>
                        <Button
                            onClick={() => onAction('flee')}
                            disabled={isPending}
                            variant="outline"
                            className="flex flex-col gap-1 h-auto py-3"
                        >
                            <FootprintsIcon className="size-5" />
                            <span className="text-xs">{t('npc.flee')}</span>
                            <span className="text-[10px] opacity-70">{t('npc.fleeDesc')}</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Battle log */}
            {turnLog.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('npc.battleLog')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-48 space-y-1.5 overflow-y-auto text-sm">
                            {[...turnLog].reverse().map((entry, i) => (
                                <div key={i} className="flex gap-2 rounded border-l-2 border-muted-foreground/30 pl-2 py-1">
                                    <Badge variant="outline" className="shrink-0 text-[10px] h-5">
                                        R{entry.round}
                                    </Badge>
                                    <span className="text-muted-foreground">{entry.message}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    )
}
