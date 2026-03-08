'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    HeartPulseIcon, AlertTriangleIcon, PartyPopperIcon,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { getActiveNpcs, type ActiveNpc } from '@/lib/game/npc-generator'
import { useCombat } from './use-combat'
import { pickpocketNPC } from '@/app/actions/combat'
import { useTranslation } from '@/lib/i18n'
import { NpcList } from './npc-list'
import { NpcMenu } from './npc-menu'
import { ChatWindow } from './chat-window'
import { CombatArena } from './combat-arena'
import { CombatResult } from './combat-result'

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
    unlockedSkills: string
}

type CombatPhase = 'select_npc' | 'npc_menu' | 'chatting' | 'in_combat' | 'result'

// ─── Main Component ─────────────────────────────────────────────────

export default function CombatContent({ player }: { player: Player }) {
    const router = useRouter()
    const { t } = useTranslation()
    const unlockedSkills: string[] = useMemo(() => JSON.parse(player.unlockedSkills || '[]'), [player.unlockedSkills])

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
        availableMoves,
        handleStartCombat,
        processTurn,
        resetCombat,
    } = useCombat(player.level, setPhase, setError, unlockedSkills)

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
                <NpcList
                    npcs={npcs}
                    isPending={isPending}
                    onSelectNpc={handleSelectNpc}
                    t={t}
                />
            )}

            {/* ═══ PHASE: NPC MENU ═══ */}
            {phase === 'npc_menu' && selectedNpc && (
                <NpcMenu
                    npc={selectedNpc}
                    isPending={isPending}
                    isPickpocketing={isPickpocketing}
                    isHospitalized={player.isHospitalized}
                    playerHealth={player.health}
                    onBack={handleBackToNpcs}
                    onChat={handleStartChat}
                    onPickpocket={handlePickpocket}
                    onFight={() => handleStartCombat(selectedNpc.id)}
                    t={t}
                />
            )}

            {/* ═══ PHASE: CHATTING ═══ */}
            {phase === 'chatting' && selectedNpc && (
                <ChatWindow
                    npc={selectedNpc}
                    chatHistory={chatHistory}
                    chatFinished={chatFinished}
                    currentReplies={currentReplies}
                    isPending={isPending}
                    isHospitalized={player.isHospitalized}
                    playerHealth={player.health}
                    onBack={handleBackToNpcMenu}
                    onReply={handleChatReply}
                    onBackToNpcs={handleBackToNpcs}
                    onFight={() => handleStartCombat(selectedNpc.id)}
                    t={t}
                />
            )}

            {/* ═══ PHASE: IN COMBAT ═══ */}
            {phase === 'in_combat' && playerStats && enemyStats && (
                <CombatArena
                    playerName={player.name}
                    playerHP={playerHP}
                    playerMaxHP={playerMaxHP}
                    enemyLabel={enemyLabel}
                    enemyHP={enemyHP}
                    enemyMaxHP={enemyMaxHP}
                    round={round}
                    isDefending={isDefending}
                    isPending={isPending}
                    turnLog={turnLog}
                    availableMoves={availableMoves}
                    onAction={processTurn}
                    t={t}
                />
            )}

            {/* ═══ PHASE: RESULT ═══ */}
            {phase === 'result' && result && (
                <CombatResult
                    result={result}
                    turnLog={turnLog}
                    onContinue={() => result.hospitalized ? router.push('/hospital') : handleBackToNpcs()}
                    t={t}
                />
            )}
        </div>
    )
}
