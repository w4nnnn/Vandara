'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    SwordsIcon, ShieldIcon, ZapIcon, TargetIcon,
    HeartIcon, SkullIcon, TrophyIcon, AlertTriangleIcon,
    CoinsIcon, StarIcon, PackageIcon, HeartPulseIcon,
    ShieldCheckIcon, FootprintsIcon, MessageCircleIcon,
    UsersIcon, ArrowLeftIcon, ActivityIcon, PartyPopperIcon,
    WrenchIcon, GemIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { getActiveNpcs, type ActiveNpc } from '@/lib/game/npc-generator'
import { ITEMS, RARITY_COLORS } from '@/lib/game/constants'
import AvatarComponent from '@/lib/avataaars'
import { useCombat } from './use-combat'
import { pickpocketNPC } from '@/app/actions/combat'
import { useTranslation } from '@/lib/i18n'

// ─── Types ──────────────────────────────────────────────────────────

type Player = {
    id: number
    name: string
    level: number
    nerve: number
    maxNerve: number
    health: number
    maxHealth: number
    strength: number
    defense: number
    speed: number
    dexterity: number
    isHospitalized: boolean
    hospitalUntil: Date | null
    currentLocation: string
}

type CombatPhase = 'select_npc' | 'npc_menu' | 'chatting' | 'in_combat' | 'result'

// ─── Components ─────────────────────────────────────────────────────

function HealthBar({
    label,
    current,
    max,
    color,
}: {
    label: string
    current: number
    max: number
    color: string
}) {
    const pct = Math.max(0, Math.round((current / max) * 100))
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm font-medium">
                <span>{label}</span>
                <span className={current <= 0 ? 'text-red-500' : ''}>
                    {Math.max(0, current)} / {max}
                </span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}

// ─── Main Component ─────────────────────────────────────────────────

export default function CombatContent({ player }: { player: Player }) {
    const router = useRouter()
    const { t } = useTranslation()

    // Phase management
    const [phase, setPhase] = useState<CombatPhase>('select_npc')
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [isPickpocketing, startPickpocketTransition] = useTransition()

    // Dynamic NPCs State
    const [npcs, setNpcs] = useState<ActiveNpc[]>([])
    const [, setTick] = useState(0) // Used to force re-render for countdowns

    useEffect(() => {
        const updateNpcs = () => {
            setNpcs(getActiveNpcs(player.level, player.currentLocation))
            setTick(t => t + 1)
        }
        updateNpcs()
        const interval = setInterval(updateNpcs, 1000)
        return () => clearInterval(interval)
    }, [player.level, player.currentLocation])

    // NPC interaction state
    const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null)
    const [chatStep, setChatStep] = useState(0)
    const [chatHistory, setChatHistory] = useState<{ sender: 'npc' | 'player'; text: string }[]>([])

    const {
        isPending,
        enemyLabel,
        playerHP,
        playerMaxHP,
        playerStats,
        enemyHP,
        enemyMaxHP,
        enemyStats,
        isDefending,
        round,
        turnLog,
        result,
        handleStartCombat,
        processTurn,
        resetCombat,
    } = useCombat(player.level, setPhase, setError)

    // ─── NPC Selection ─────────────────────────────────────────────

    const selectedNpc = npcs.find((e) => e.id === selectedNpcId)

    const handleSelectNpc = (npcId: string) => {
        setSelectedNpcId(npcId)
        setError(null)
        setSuccessMsg(null)
        setPhase('npc_menu')
    }

    const handlePickpocket = () => {
        if (!selectedNpc) return
        setError(null)
        setSuccessMsg(null)
        startPickpocketTransition(async () => {
            const res = await pickpocketNPC(selectedNpc.id)
            if (res.error) {
                setError(res.error)
                return
            }
            if (res.success) {
                setSuccessMsg(`Berhasil mencopet $${res.moneyStolen}!`)
                router.refresh()
            } else {
                setError(`Gagal mencopet! Kamu ketahuan dan dipukul, terkena ${res.damageReceived} damage.`)
                if (res.hospitalized) {
                    setTimeout(() => router.push('/hospital'), 2000)
                }
                router.refresh()
            }
        })
    }

    const handleStartChat = () => {
        if (!selectedNpc) return
        setChatStep(0)
        setChatHistory([{ sender: 'npc', text: selectedNpc.dialogue.greeting }])
        setPhase('chatting')
    }

    const handleChatReply = (replyText: string) => {
        if (!selectedNpc) return
        const dialogue = selectedNpc.dialogue
        const newHistory = [...chatHistory, { sender: 'player' as const, text: replyText }]

        if (chatStep < dialogue.lines.length) {
            newHistory.push({ sender: 'npc', text: dialogue.lines[chatStep].npc })
            setChatHistory(newHistory)
            setChatStep(chatStep + 1)
        }

        // If we've gone through all lines after this reply, show farewell
        if (chatStep + 1 >= dialogue.lines.length) {
            newHistory.push({ sender: 'npc', text: dialogue.farewell })
            setChatHistory(newHistory)
            setChatStep(dialogue.lines.length) // mark as finished
        }
    }

    const chatFinished = selectedNpc ? chatStep >= selectedNpc.dialogue.lines.length : false
    const currentReplies = selectedNpc && chatStep < selectedNpc.dialogue.lines.length
        ? selectedNpc.dialogue.lines[chatStep].replies
        : []

    // ─── Reset ───────────────────────────────────────────────────────

    const handleBackToNpcs = () => {
        setPhase('select_npc')
        setSelectedNpcId(null)
        resetCombat()
        setError(null)
        setSuccessMsg(null)
        setChatHistory([])
        setChatStep(0)
        router.refresh()
    }

    const handleBackToNpcMenu = () => {
        setPhase('npc_menu')
        setChatHistory([])
        setChatStep(0)
        setError(null)
    }

    // ─── Render ──────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Hospital Banner */}
            {player.isHospitalized && phase === 'select_npc' && (
                <Alert variant="destructive">
                    <HeartPulseIcon className="size-4" />
                    <AlertTitle>{t('npc.hospitalBannerTitle')}</AlertTitle>
                    <AlertDescription>
                        {t('npc.hospitalBanner')}
                    </AlertDescription>
                </Alert>
            )}

            {/* Error */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangleIcon className="size-4" />
                    <AlertTitle>Perhatian</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Success */}
            {successMsg && (
                <Alert className="border-green-500/50 bg-green-500/10 text-green-500">
                    <PartyPopperIcon className="size-4" color="currentColor" />
                    <AlertTitle>Berhasil</AlertTitle>
                    <AlertDescription>{successMsg}</AlertDescription>
                </Alert>
            )}

            {/* ═══ PHASE: SELECT NPC ═══ */}
            {phase === 'select_npc' && (
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
                                                {/* Equipment badges */}
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
                                            onClick={() => handleSelectNpc(npc.id)}
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
            )}

            {/* ═══ PHASE: NPC MENU ═══ */}
            {phase === 'npc_menu' && selectedNpc && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="size-8" onClick={handleBackToNpcs}>
                                <ArrowLeftIcon className="size-4" />
                            </Button>
                            <div>
                                <CardTitle className="text-base">{selectedNpc.label}</CardTitle>
                                <CardDescription>{selectedNpc.description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* NPC Stats */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <SwordsIcon className="size-3" /> STR {selectedNpc.strength}
                            </span>
                            <span className="flex items-center gap-1">
                                <ShieldIcon className="size-3" /> DEF {selectedNpc.defense}
                            </span>
                            <span className="flex items-center gap-1">
                                <ZapIcon className="size-3" /> SPD {selectedNpc.speed}
                            </span>
                            <span className="flex items-center gap-1">
                                <TargetIcon className="size-3" /> DEX {selectedNpc.dexterity}
                            </span>
                            <span className="flex items-center gap-1">
                                <HeartIcon className="size-3" /> HP {selectedNpc.maxHealth}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 text-xs">
                            <span className="flex items-center gap-1 text-green-600"><CoinsIcon className="h-4 w-4" /> ${selectedNpc.moneyDrop[0]}–${selectedNpc.moneyDrop[1]}</span>
                            <span className="flex items-center gap-1 text-blue-600"><StarIcon className="h-4 w-4" /> {selectedNpc.xpDrop} XP</span>
                            <span className="flex items-center gap-1 text-orange-600"><ActivityIcon className="h-4 w-4" /> {selectedNpc.nerveCost} nerve</span>
                        </div>

                        {/* Equipment section */}
                        {(selectedNpc.equipment.weapon || selectedNpc.equipment.armor || selectedNpc.equipment.accessory) && (
                            <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
                                <p className="text-xs font-semibold text-muted-foreground">PERLENGKAPAN</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedNpc.equipment.weapon && (() => {
                                        const def = ITEMS[selectedNpc.equipment.weapon!]
                                        return (
                                            <div className="flex items-center gap-1.5">
                                                <SwordsIcon className="size-3.5 text-red-500" />
                                                <span className="text-xs font-medium">{def?.label ?? selectedNpc.equipment.weapon}</span>
                                                {def && <Badge variant="outline" className={`text-[9px] ${RARITY_COLORS[def.rarity]}`}>{def.rarity}</Badge>}
                                            </div>
                                        )
                                    })()}
                                    {selectedNpc.equipment.armor && (() => {
                                        const def = ITEMS[selectedNpc.equipment.armor!]
                                        return (
                                            <div className="flex items-center gap-1.5">
                                                <ShieldIcon className="size-3.5 text-blue-500" />
                                                <span className="text-xs font-medium">{def?.label ?? selectedNpc.equipment.armor}</span>
                                                {def && <Badge variant="outline" className={`text-[9px] ${RARITY_COLORS[def.rarity]}`}>{def.rarity}</Badge>}
                                            </div>
                                        )
                                    })()}
                                    {selectedNpc.equipment.accessory && (() => {
                                        const def = ITEMS[selectedNpc.equipment.accessory!]
                                        return (
                                            <div className="flex items-center gap-1.5">
                                                <GemIcon className="size-3.5 text-purple-500" />
                                                <span className="text-xs font-medium">{def?.label ?? selectedNpc.equipment.accessory}</span>
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
                                onClick={handleStartChat}
                                disabled={isPickpocketing}
                            >
                                <MessageCircleIcon className="size-5" />
                                <span className="text-xs font-medium">{t('npc.chat')}</span>
                                <span className="text-[9px] text-muted-foreground">{t('npc.talkTo')}</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex flex-col gap-1 h-auto py-4"
                                onClick={handlePickpocket}
                                disabled={isPickpocketing || player.isHospitalized || player.health <= 0}
                            >
                                <FootprintsIcon className="size-5" />
                                <span className="text-xs font-medium">Copet</span>
                                <span className="text-[9px] text-muted-foreground">-3 nerve</span>
                            </Button>
                            <Button
                                variant="default"
                                className="flex flex-col gap-1 h-auto py-4"
                                disabled={isPending || isPickpocketing || player.isHospitalized || player.health <= 0}
                                onClick={() => handleStartCombat(selectedNpc.id)}
                            >
                                <SwordsIcon className="size-5" />
                                <span className="text-xs font-medium">{t('npc.challenge')}</span>
                                <span className="text-[9px] opacity-70">{t('npc.fightWith')}</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ═══ PHASE: CHATTING ═══ */}
            {phase === 'chatting' && selectedNpc && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="size-8" onClick={handleBackToNpcMenu}>
                                <ArrowLeftIcon className="size-4" />
                            </Button>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MessageCircleIcon className="size-5" />
                                {t('npc.chatWith', { name: selectedNpc.label })}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Chat history */}
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {chatHistory.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'npc'
                                            ? 'bg-muted text-foreground rounded-bl-md'
                                            : 'bg-primary text-primary-foreground rounded-br-md'
                                            }`}
                                    >
                                        {msg.sender === 'npc' && (
                                            <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">
                                                {selectedNpc.label}
                                            </p>
                                        )}
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply options */}
                        {!chatFinished && currentReplies.length > 0 && (
                            <div className="space-y-2 border-t pt-3">
                                <p className="text-xs text-muted-foreground">{t('npc.chooseReply')}</p>
                                {currentReplies.map((reply, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-left h-auto py-2 text-sm whitespace-normal"
                                        onClick={() => handleChatReply(reply)}
                                    >
                                        {reply}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Chat finished */}
                        {chatFinished && (
                            <div className="border-t pt-3 space-y-3">
                                <p className="text-sm text-muted-foreground text-center">
                                    {t('npc.chatFinished')}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" onClick={handleBackToNpcs}>
                                        {t('npc.back')}
                                    </Button>
                                    <Button
                                        onClick={() => handleStartCombat(selectedNpc.id)}
                                        disabled={isPending || player.isHospitalized || player.health <= 0}
                                    >
                                        <SwordsIcon className="size-4 mr-2" />
                                        {t('npc.challenge')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ═══ PHASE: IN COMBAT (Turn-Based) ═══ */}
            {phase === 'in_combat' && playerStats && enemyStats && (
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
                                        label={player.name}
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
                                    onClick={() => processTurn('attack')}
                                    disabled={isPending}
                                    variant="default"
                                    className="flex flex-col gap-1 h-auto py-3"
                                >
                                    <SwordsIcon className="size-5" />
                                    <span className="text-xs">{t('npc.attack')}</span>
                                    <span className="text-[10px] opacity-70">{t('npc.attackDesc')}</span>
                                </Button>
                                <Button
                                    onClick={() => processTurn('heavy_attack')}
                                    disabled={isPending}
                                    variant="default"
                                    className="flex flex-col gap-1 h-auto py-3 bg-orange-600 hover:bg-orange-700"
                                >
                                    <SwordsIcon className="size-5" />
                                    <span className="text-xs">{t('npc.heavyAttack')}</span>
                                    <span className="text-[10px] opacity-70">{t('npc.heavyAttackDesc')}</span>
                                </Button>
                                <Button
                                    onClick={() => processTurn('defend')}
                                    disabled={isPending}
                                    variant="secondary"
                                    className="flex flex-col gap-1 h-auto py-3"
                                >
                                    <ShieldCheckIcon className="size-5" />
                                    <span className="text-xs">{t('npc.defend')}</span>
                                    <span className="text-[10px] opacity-70">{t('npc.defendDesc')}</span>
                                </Button>
                                <Button
                                    onClick={() => processTurn('flee')}
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
                                    {[...turnLog].reverse().map((t, i) => (
                                        <div key={i} className="flex gap-2 rounded border-l-2 border-muted-foreground/30 pl-2 py-1">
                                            <Badge variant="outline" className="shrink-0 text-[10px] h-5">
                                                R{t.round}
                                            </Badge>
                                            <span className="text-muted-foreground">{t.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* ═══ PHASE: RESULT ═══ */}
            {phase === 'result' && result && (
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
                                        <span>{t('npc.totalDamageDealt')}: <strong>{turnLog.reduce((s, t) => s + t.playerDamage, 0)}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldIcon className="size-3.5 text-blue-500" />
                                        <span>{t('npc.totalDamageTaken')}: <strong>{turnLog.reduce((s, t) => s + t.enemyDamage, 0)}</strong></span>
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
                                        {turnLog.map((t, i) => (
                                            <div key={i} className="flex gap-2 rounded border-l-2 border-muted-foreground/30 pl-2 py-1">
                                                <Badge variant="outline" className="shrink-0 text-[10px] h-5">
                                                    R{t.round}
                                                </Badge>
                                                <span className="text-muted-foreground">{t.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </details>
                    )}

                    <Button
                        onClick={() => result.hospitalized ? router.push('/hospital') : handleBackToNpcs()}
                        className="w-full"
                        variant={result.hospitalized ? 'destructive' : 'default'}
                    >
                        {result.hospitalized ? t('npc.toHospital') : t('npc.backToNpc')}
                    </Button>
                </>
            )}
        </div>
    )
}
