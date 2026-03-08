'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    SwordsIcon, ShieldIcon, TrophyIcon, SkullIcon,
    CoinsIcon, StarIcon, PackageIcon, HeartPulseIcon,
    FootprintsIcon, PartyPopperIcon,
} from 'lucide-react'

type TurnLogEntry = {
    round: number
    message: string
    playerDamage: number
    enemyDamage: number
}

type CombatResultType = {
    won: boolean
    moneyEarned: number
    xpEarned: number
    leveledUp?: boolean
    newLevel?: number
    itemsDropped: { itemId: string }[]
    hospitalized?: boolean
    hospitalSeconds?: number
}

type CombatResultProps = {
    result: CombatResultType
    turnLog: TurnLogEntry[]
    onContinue: () => void
    t: (key: string, params?: Record<string, string>) => string
}

export function CombatResult({ result, turnLog, onContinue, t }: CombatResultProps) {
    return (
        <>
            <Card className={result.won ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        {result.won ? (
                            <>
                                <TrophyIcon className="size-6 text-yellow-500" />
                                <span className="text-green-600 dark:text-green-400">{t('npc.victory')}</span>
                            </>
                        ) : result.hospitalized ? (
                            <>
                                <SkullIcon className="size-6 text-red-500" />
                                <span className="text-red-600 dark:text-red-400">{t('npc.defeat')}</span>
                            </>
                        ) : (
                            <>
                                <FootprintsIcon className="size-6 text-yellow-600" />
                                <span className="text-yellow-600 dark:text-yellow-400">{t('npc.fled')}</span>
                            </>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Stats summary */}
                    {turnLog.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <SwordsIcon className="size-3.5 text-orange-500" />
                                <span>{t('npc.totalDamageDealt')}: <strong>{turnLog.reduce((s, e) => s + e.playerDamage, 0)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldIcon className="size-3.5 text-blue-500" />
                                <span>{t('npc.totalDamageTaken')}: <strong>{turnLog.reduce((s, e) => s + e.enemyDamage, 0)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{t('npc.totalRounds')}: <strong>{turnLog.length}</strong></span>
                            </div>
                        </div>
                    )}

                    {/* Rewards */}
                    {result.won && (
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="gap-1">
                                    <CoinsIcon className="size-3" />
                                    +${result.moneyEarned.toLocaleString()}
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                    <StarIcon className="size-3" />
                                    +{result.xpEarned} XP
                                </Badge>
                                {result.leveledUp && (
                                    <Badge className="gap-1 bg-yellow-500 text-yellow-950">
                                        <PartyPopperIcon className="inline mr-1 h-4 w-4" /> Level {result.newLevel}!
                                    </Badge>
                                )}
                            </div>
                            {result.itemsDropped.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {result.itemsDropped.map((item, i) => (
                                        <Badge key={i} variant="outline" className="gap-1">
                                            <PackageIcon className="size-3" />
                                            {t(`item.${item.itemId}`)}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hospitalized */}
                    {result.hospitalized && (
                        <Alert variant="destructive" className="mt-2">
                            <HeartPulseIcon className="size-4" />
                            <AlertTitle>{t('npc.hospitalized')}</AlertTitle>
                            <AlertDescription>
                                {t('npc.hospitalizedDesc', { seconds: String(result.hospitalSeconds) })}
                                <p className="mt-1 text-xs opacity-80">Mengalihkan ke rumah sakit dalam 2.5 detik...</p>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Battle log (collapsible) */}
            {turnLog.length > 0 && (
                <details>
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                        {t('npc.viewFullLog', { count: String(turnLog.length) })}
                    </summary>
                    <Card>
                        <CardContent className="p-4">
                            <div className="max-h-64 space-y-1.5 overflow-y-auto text-sm">
                                {turnLog.map((entry, i) => (
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
                </details>
            )}

            <Button
                onClick={onContinue}
                className="w-full"
                variant={result.hospitalized ? 'destructive' : 'default'}
            >
                {result.hospitalized ? t('npc.toHospital') : t('npc.backToNpc')}
            </Button>
        </>
    )
}
