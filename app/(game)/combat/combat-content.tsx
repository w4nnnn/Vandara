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
    UsersIcon, ArrowLeftIcon,
} from 'lucide-react'
import { initiateCombat, finishCombat } from '@/app/actions/combat'
import { NPC_ENEMIES } from '@/lib/game/constants'

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
}

type CombatantStats = {
    health: number
    maxHealth: number
    strength: number
    defense: number
    speed: number
    dexterity: number
}

type TurnAction = 'attack' | 'heavy_attack' | 'defend' | 'flee'

type TurnLog = {
    round: number
    playerAction: TurnAction
    playerDamage: number
    enemyDamage: number
    playerHealth: number
    enemyHealth: number
    message: string
    fled?: boolean
}

type CombatPhase = 'select_npc' | 'npc_menu' | 'chatting' | 'in_combat' | 'result'

// ─── Combat Logic (client-side) ─────────────────────────────────────

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function calcDamage(
    attacker: CombatantStats,
    defender: CombatantStats,
    multiplier: number = 1.0
): number {
    const hitChance =
        (attacker.speed + attacker.dexterity) /
        (attacker.speed + attacker.dexterity + defender.speed + defender.dexterity) + 0.15
    if (Math.random() > hitChance) return 0 // miss
    const raw = randomInt(1, Math.ceil(attacker.strength * multiplier))
    const block = randomInt(0, Math.floor(defender.defense / 2))
    return Math.max(1, raw - block)
}

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
    const [isPending, startTransition] = useTransition()

    // Phase management
    const [phase, setPhase] = useState<CombatPhase>('select_npc')
    const [error, setError] = useState<string | null>(null)

    // NPC interaction state
    const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null)
    const [chatStep, setChatStep] = useState(0)
    const [chatHistory, setChatHistory] = useState<{ sender: 'npc' | 'player'; text: string }[]>([])

    // Combat state
    const [enemyId, setEnemyId] = useState<string | null>(null)
    const [enemyLabel, setEnemyLabel] = useState('')
    const [playerHP, setPlayerHP] = useState(0)
    const [playerMaxHP, setPlayerMaxHP] = useState(0)
    const [playerStats, setPlayerStats] = useState<CombatantStats | null>(null)
    const [enemyHP, setEnemyHP] = useState(0)
    const [enemyMaxHP, setEnemyMaxHP] = useState(0)
    const [enemyStats, setEnemyStats] = useState<CombatantStats | null>(null)
    const [isDefending, setIsDefending] = useState(false)
    const [round, setRound] = useState(0)
    const [turnLog, setTurnLog] = useState<TurnLog[]>([])

    // Result state
    const [result, setResult] = useState<{
        won: boolean
        moneyEarned: number
        xpEarned: number
        leveledUp: boolean
        newLevel: number
        itemsDropped: { itemId: string; label: string }[]
        hospitalized: boolean
        hospitalSeconds: number
    } | null>(null)

    // ─── NPC Selection ─────────────────────────────────────────────

    const selectedNpc = NPC_ENEMIES.find((e) => e.id === selectedNpcId)

    const handleSelectNpc = (npcId: string) => {
        setSelectedNpcId(npcId)
        setError(null)
        setPhase('npc_menu')
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

    // ─── Start combat ────────────────────────────────────────────────

    const handleStartCombat = (eId: string) => {
        setError(null)
        startTransition(async () => {
            const res = await initiateCombat(eId)
            if ('error' in res) {
                setError(res.error ?? 'An error occurred')
                return
            }
            setEnemyId(eId)
            setEnemyLabel(res.enemyStats.label)
            setPlayerHP(res.playerStats.health)
            setPlayerMaxHP(res.playerStats.maxHealth)
            setPlayerStats(res.playerStats)
            setEnemyHP(res.enemyStats.health)
            setEnemyMaxHP(res.enemyStats.maxHealth)
            setEnemyStats(res.enemyStats)
            setIsDefending(false)
            setRound(1)
            setTurnLog([])
            setResult(null)
            setPhase('in_combat')
        })
    }

    // ─── Process a turn ──────────────────────────────────────────────

    const processTurn = useCallback((action: TurnAction) => {
        if (!playerStats || !enemyStats || !enemyId) return

        let newPlayerHP = playerHP
        let newEnemyHP = enemyHP
        let playerDmg = 0
        let enemyDmg = 0
        let message = ''
        let fled = false

        if (action === 'flee') {
            const fleeChance = (playerStats.speed + playerStats.dexterity) /
                (playerStats.speed + playerStats.dexterity + enemyStats.speed + enemyStats.dexterity) + 0.1
            if (Math.random() < fleeChance) {
                fled = true
                message = 'You successfully fled the battle!'
            } else {
                // Failed flee — enemy gets a free hit
                enemyDmg = calcDamage(enemyStats, playerStats)
                newPlayerHP -= enemyDmg
                message = `You tried to flee but failed! Enemy hits you for ${enemyDmg} damage.`
            }
        } else {
            // Player attacks
            if (action === 'attack') {
                playerDmg = calcDamage(playerStats, enemyStats, 1.0)
                message = playerDmg > 0
                    ? `You strike for ${playerDmg} damage.`
                    : 'Your attack missed!'
            } else if (action === 'heavy_attack') {
                // Higher damage, lower accuracy (handled by lower effective speed)
                const boosted = { ...playerStats, strength: Math.ceil(playerStats.strength * 1.8), speed: Math.ceil(playerStats.speed * 0.5) }
                playerDmg = calcDamage(boosted, enemyStats, 1.0)
                message = playerDmg > 0
                    ? `Heavy strike! ${playerDmg} damage!`
                    : 'Your heavy attack missed!'
            } else if (action === 'defend') {
                setIsDefending(true)
                message = 'You brace yourself for the next attack.'
            }

            newEnemyHP -= playerDmg

            // Enemy attacks back (if still alive)
            if (newEnemyHP > 0) {
                const defMultiplier = (action === 'defend' || isDefending) ? 2.0 : 1.0
                const defendingPlayer = {
                    ...playerStats,
                    defense: Math.ceil(playerStats.defense * defMultiplier),
                }
                enemyDmg = calcDamage(enemyStats, defendingPlayer)
                newPlayerHP -= enemyDmg
                message += enemyDmg > 0
                    ? ` Enemy hits you for ${enemyDmg}${action === 'defend' ? ' (reduced)' : ''}.`
                    : ' Enemy missed!'
            } else {
                message += ' Enemy is defeated!'
            }

            // Reset defending unless we just defended
            if (action !== 'defend') {
                setIsDefending(false)
            }
        }

        const logEntry: TurnLog = {
            round,
            playerAction: action,
            playerDamage: playerDmg,
            enemyDamage: enemyDmg,
            playerHealth: Math.max(0, newPlayerHP),
            enemyHealth: Math.max(0, newEnemyHP),
            message,
            fled,
        }

        setPlayerHP(Math.max(0, newPlayerHP))
        setEnemyHP(Math.max(0, newEnemyHP))
        setTurnLog((prev) => [...prev, logEntry])
        setRound((r) => r + 1)

        // Check combat end
        if (fled) {
            // Fled — no rewards, no punishment, just end
            const totalDealt = turnLog.reduce((s, t) => s + t.playerDamage, 0) + playerDmg
            const totalTaken = turnLog.reduce((s, t) => s + t.enemyDamage, 0) + enemyDmg
            startTransition(async () => {
                // Update health on server
                const res = await finishCombat(enemyId, false, totalDealt, totalTaken, Math.max(0, newPlayerHP))
                // For flee, we set a custom result
                setResult({
                    won: false,
                    moneyEarned: 0,
                    xpEarned: 0,
                    leveledUp: false,
                    newLevel: player.level,
                    itemsDropped: [],
                    hospitalized: false,
                    hospitalSeconds: 0,
                })
                setPhase('result')
                router.refresh()
            })
        } else if (newEnemyHP <= 0 || newPlayerHP <= 0) {
            const won = newEnemyHP <= 0
            const totalDealt = turnLog.reduce((s, t) => s + t.playerDamage, 0) + playerDmg
            const totalTaken = turnLog.reduce((s, t) => s + t.enemyDamage, 0) + enemyDmg

            startTransition(async () => {
                const res = await finishCombat(enemyId, won, totalDealt, totalTaken, Math.max(0, newPlayerHP))
                if ('error' in res) {
                    setError(res.error ?? 'An error occurred')
                    return
                }
                setResult({
                    won: res.won,
                    moneyEarned: res.moneyEarned,
                    xpEarned: res.xpEarned,
                    leveledUp: res.leveledUp,
                    newLevel: res.newLevel,
                    itemsDropped: res.itemsDropped,
                    hospitalized: res.hospitalized,
                    hospitalSeconds: res.hospitalSeconds,
                })
                setPhase('result')
                router.refresh()
            })
        }
    }, [playerHP, enemyHP, playerStats, enemyStats, enemyId, round, turnLog, isDefending, player.level, router, startTransition])

    // ─── Reset ───────────────────────────────────────────────────────

    const handleBackToNpcs = () => {
        setPhase('select_npc')
        setSelectedNpcId(null)
        setResult(null)
        setTurnLog([])
        setError(null)
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
                    <AlertTitle>Dirawat di Rumah Sakit</AlertTitle>
                    <AlertDescription>
                        Kamu sedang dirawat. Kamu tidak bisa bertarung sampai keluar dari rumah sakit.
                    </AlertDescription>
                </Alert>
            )}

            {/* Error */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangleIcon className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* ═══ PHASE: SELECT NPC ═══ */}
            {phase === 'select_npc' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UsersIcon className="size-5" />
                            Orang-orang di Sekitar
                        </CardTitle>
                        <CardDescription>
                            Temui NPC di gang gelap. Kamu bisa mengajak mereka ngobrol atau menantang mereka bertarung.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {NPC_ENEMIES.map((npc) => {
                                const locked = player.level < npc.level
                                return (
                                    <div
                                        key={npc.id}
                                        className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${locked ? 'opacity-50' : 'hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{npc.label}</h3>
                                                <Badge variant={locked ? 'secondary' : 'outline'} className="text-xs">
                                                    Lv.{npc.level}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{npc.description}</p>
                                        </div>
                                        <Button
                                            variant={locked ? 'secondary' : 'default'}
                                            size="sm"
                                            disabled={locked || isPending}
                                            onClick={() => handleSelectNpc(npc.id)}
                                            className="shrink-0"
                                        >
                                            {locked ? `Butuh Lv.${npc.level}` : 'Temui'}
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
                            <span className="text-green-600">💰 ${selectedNpc.moneyDrop[0]}–${selectedNpc.moneyDrop[1]}</span>
                            <span className="text-blue-600">⭐ {selectedNpc.xpDrop} XP</span>
                            <span className="text-orange-600">⚡ {selectedNpc.nerveCost} nerve</span>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="flex flex-col gap-1 h-auto py-4"
                                onClick={handleStartChat}
                            >
                                <MessageCircleIcon className="size-5" />
                                <span className="text-sm font-medium">Ngobrol</span>
                                <span className="text-[10px] text-muted-foreground">Ajak bicara</span>
                            </Button>
                            <Button
                                variant="default"
                                className="flex flex-col gap-1 h-auto py-4"
                                disabled={isPending || player.isHospitalized || player.health <= 0}
                                onClick={() => handleStartCombat(selectedNpc.id)}
                            >
                                <SwordsIcon className="size-5" />
                                <span className="text-sm font-medium">Tantang</span>
                                <span className="text-[10px] opacity-70">Ajak berantem</span>
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
                                Ngobrol dengan {selectedNpc.label}
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
                                <p className="text-xs text-muted-foreground">Pilih balasan:</p>
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
                                    Percakapan selesai.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" onClick={handleBackToNpcs}>
                                        Kembali
                                    </Button>
                                    <Button
                                        onClick={() => handleStartCombat(selectedNpc.id)}
                                        disabled={isPending || player.isHospitalized || player.health <= 0}
                                    >
                                        <SwordsIcon className="size-4 mr-2" />
                                        Tantang
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
                                        YOU
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
                                        ENEMY
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
                                Round {round} {isDefending && <Badge variant="outline" className="ml-2 text-xs">🛡️ Defending</Badge>}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Action buttons */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Choose Action</CardTitle>
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
                                    <span className="text-xs">Attack</span>
                                    <span className="text-[10px] opacity-70">Balanced hit</span>
                                </Button>
                                <Button
                                    onClick={() => processTurn('heavy_attack')}
                                    disabled={isPending}
                                    variant="default"
                                    className="flex flex-col gap-1 h-auto py-3 bg-orange-600 hover:bg-orange-700"
                                >
                                    <SwordsIcon className="size-5" />
                                    <span className="text-xs">Heavy Attack</span>
                                    <span className="text-[10px] opacity-70">High dmg, low acc</span>
                                </Button>
                                <Button
                                    onClick={() => processTurn('defend')}
                                    disabled={isPending}
                                    variant="secondary"
                                    className="flex flex-col gap-1 h-auto py-3"
                                >
                                    <ShieldCheckIcon className="size-5" />
                                    <span className="text-xs">Defend</span>
                                    <span className="text-[10px] opacity-70">Halve damage</span>
                                </Button>
                                <Button
                                    onClick={() => processTurn('flee')}
                                    disabled={isPending}
                                    variant="outline"
                                    className="flex flex-col gap-1 h-auto py-3"
                                >
                                    <FootprintsIcon className="size-5" />
                                    <span className="text-xs">Flee</span>
                                    <span className="text-[10px] opacity-70">Chance to escape</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Battle log */}
                    {turnLog.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Battle Log</CardTitle>
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
                                        <span className="text-green-600 dark:text-green-400">Victory!</span>
                                    </>
                                ) : result.hospitalized ? (
                                    <>
                                        <SkullIcon className="size-6 text-red-500" />
                                        <span className="text-red-600 dark:text-red-400">Defeated!</span>
                                    </>
                                ) : (
                                    <>
                                        <FootprintsIcon className="size-6 text-yellow-600" />
                                        <span className="text-yellow-600 dark:text-yellow-400">Fled</span>
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
                                        <span>Total damage dealt: <strong>{turnLog.reduce((s, t) => s + t.playerDamage, 0)}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldIcon className="size-3.5 text-blue-500" />
                                        <span>Total damage taken: <strong>{turnLog.reduce((s, t) => s + t.enemyDamage, 0)}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <span>Rounds fought: <strong>{turnLog.length}</strong></span>
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
                                                🎉 Level {result.newLevel}!
                                            </Badge>
                                        )}
                                    </div>
                                    {result.itemsDropped.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {result.itemsDropped.map((item, i) => (
                                                <Badge key={i} variant="outline" className="gap-1">
                                                    <PackageIcon className="size-3" />
                                                    {item.label}
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
                                    <AlertTitle>Hospitalized!</AlertTitle>
                                    <AlertDescription>
                                        You were defeated. Hospital time: {result.hospitalSeconds}s
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Battle log (collapsible) */}
                    {turnLog.length > 0 && (
                        <details>
                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                                View full battle log ({turnLog.length} rounds)
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

                    <Button onClick={handleBackToNpcs} className="w-full">
                        {result.hospitalized ? 'Ke Rumah Sakit' : 'Kembali ke NPC'}
                    </Button>
                </>
            )}
        </div>
    )
}
