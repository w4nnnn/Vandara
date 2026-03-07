import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { initiateCombat, finishCombat } from '@/app/actions/combat'

export type CombatantStats = {
    health: number
    maxHealth: number
    strength: number
    defense: number
    speed: number
    dexterity: number
}

export type TurnAction = 'attack' | 'heavy_attack' | 'defend' | 'flee'

export type TurnLog = {
    round: number
    playerAction: TurnAction
    playerDamage: number
    enemyDamage: number
    playerHealth: number
    enemyHealth: number
    message: string
    fled?: boolean
}

export type CombatResultData = {
    won: boolean
    moneyEarned: number
    xpEarned: number
    leveledUp: boolean
    newLevel: number
    itemsDropped: { itemId: string; label: string }[]
    hospitalized: boolean
    hospitalSeconds: number
}

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

export function useCombat(
    playerLevel: number,
    onPhaseChange: (phase: 'in_combat' | 'result') => void,
    onError: (err: string) => void
) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

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
    const [result, setResult] = useState<CombatResultData | null>(null)

    const handleStartCombat = useCallback((eId: string) => {
        startTransition(async () => {
            const res = await initiateCombat(eId)
            if ('error' in res) {
                onError(res.error ?? 'Terjadi kesalahan')
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
            onPhaseChange('in_combat')
        })
    }, [onError, onPhaseChange])

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
                message = 'Kamu berhasil kabur dari pertarungan!'
            } else {
                enemyDmg = calcDamage(enemyStats, playerStats)
                newPlayerHP -= enemyDmg
                message = `Kamu gagal kabur! Musuh menyerangmu dan memberikan ${enemyDmg} damage.`
            }
        } else {
            if (action === 'attack') {
                playerDmg = calcDamage(playerStats, enemyStats, 1.0)
                message = playerDmg > 0
                    ? `Kamu menyerang dan memberikan ${playerDmg} damage.`
                    : 'Seranganmu meleset!'
            } else if (action === 'heavy_attack') {
                const boosted = { ...playerStats, strength: Math.ceil(playerStats.strength * 1.8), speed: Math.ceil(playerStats.speed * 0.5) }
                playerDmg = calcDamage(boosted, enemyStats, 1.0)
                message = playerDmg > 0
                    ? `Serangan keras! ${playerDmg} damage!`
                    : 'Serangan kerasmu meleset!'
            } else if (action === 'defend') {
                setIsDefending(true)
                message = 'Kamu bertahan untuk menahan serangan berikutnya.'
            }

            newEnemyHP -= playerDmg

            // Musuh menyerang kembali (jika masih hidup)
            if (newEnemyHP > 0) {
                const defMultiplier = (action === 'defend' || isDefending) ? 2.0 : 1.0
                const defendingPlayer = {
                    ...playerStats,
                    defense: Math.ceil(playerStats.defense * defMultiplier),
                }
                enemyDmg = calcDamage(enemyStats, defendingPlayer)
                newPlayerHP -= enemyDmg
                message += enemyDmg > 0
                    ? ` Musuh membalas dan memberikan ${enemyDmg} damage${action === 'defend' ? ' (berkurang karena bertahan)' : ''}.`
                    : ' Serangan musuh meleset!'
            } else {
                message += ' Musuh berhasil dikalahkan!'
            }

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

        if (fled) {
            const totalDealt = turnLog.reduce((s, t) => s + t.playerDamage, 0) + playerDmg
            const totalTaken = turnLog.reduce((s, t) => s + t.enemyDamage, 0) + enemyDmg
            startTransition(async () => {
                await finishCombat(enemyId, false, totalDealt, totalTaken, Math.max(0, newPlayerHP))
                setResult({
                    won: false,
                    moneyEarned: 0,
                    xpEarned: 0,
                    leveledUp: false,
                    newLevel: playerLevel,
                    itemsDropped: [],
                    hospitalized: false,
                    hospitalSeconds: 0,
                })
                onPhaseChange('result')
                router.refresh()
            })
        } else if (newEnemyHP <= 0 || newPlayerHP <= 0) {
            const won = newEnemyHP <= 0
            const totalDealt = turnLog.reduce((s, t) => s + t.playerDamage, 0) + playerDmg
            const totalTaken = turnLog.reduce((s, t) => s + t.enemyDamage, 0) + enemyDmg

            startTransition(async () => {
                const res = await finishCombat(enemyId, won, totalDealt, totalTaken, Math.max(0, newPlayerHP))
                if ('error' in res) {
                    onError(res.error ?? 'Terjadi kesalahan')
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
                onPhaseChange('result')
                router.refresh()
            })
        }
    }, [playerHP, enemyHP, playerStats, enemyStats, enemyId, round, turnLog, isDefending, playerLevel, router, onError, onPhaseChange])

    const resetCombat = useCallback(() => {
        setResult(null)
        setTurnLog([])
        setEnemyId(null)
    }, [])

    return {
        isPending,
        enemyId,
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
    }
}
