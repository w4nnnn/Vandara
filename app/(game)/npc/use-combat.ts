import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { initiateCombat, finishCombat } from '@/app/actions/combat'
import { useTranslation } from '@/lib/i18n'
import { SPECIAL_MOVES } from '@/lib/game/constants'

export type CombatantStats = {
    health: number
    maxHealth: number
    strength: number
    defense: number
    speed: number
    dexterity: number
}

export type TurnAction = 'attack' | 'heavy_attack' | 'defend' | 'flee' | `special_${string}`

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
    itemsDropped: { itemId: string }[]
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
    onError: (err: string) => void,
    unlockedSkills: string[] = []
) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const { t } = useTranslation()

    const [enemyId, setEnemyId] = useState<string | null>(null)
    const [enemyLabel, setEnemyLabel] = useState('')
    const [playerHP, setPlayerHP] = useState(0)
    const [playerMaxHP, setPlayerMaxHP] = useState(0)
    const [playerStats, setPlayerStats] = useState<CombatantStats | null>(null)
    const [enemyHP, setEnemyHP] = useState(0)
    const [enemyMaxHP, setEnemyMaxHP] = useState(0)
    const [enemyStats, setEnemyStats] = useState<CombatantStats | null>(null)
    const [isDefending, setIsDefending] = useState(false)
    const [enemyStunned, setEnemyStunned] = useState(false)
    const [enemyBleedDmg, setEnemyBleedDmg] = useState(0)
    const [round, setRound] = useState(0)
    const [turnLog, setTurnLog] = useState<TurnLog[]>([])
    const [result, setResult] = useState<CombatResultData | null>(null)

    // Available special moves based on level and skills
    const availableMoves = SPECIAL_MOVES.filter(m => {
        if (playerLevel < m.levelRequired) return false
        if (m.skillRequired && !unlockedSkills.includes(m.skillRequired)) return false
        return true
    })

    const handleStartCombat = useCallback((eId: string) => {
        startTransition(async () => {
            const res = await initiateCombat(eId)
            if ('error' in res) {
                onError(res.error ?? t('combat.error'))
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
    }, [onError, onPhaseChange, t])

    const processTurn = useCallback((action: TurnAction) => {
        if (!playerStats || !enemyStats || !enemyId) return

        let newPlayerHP = playerHP
        let newEnemyHP = enemyHP
        let playerDmg = 0
        let enemyDmg = 0
        let message = ''
        let fled = false
        let newEnemyStunned = false
        let newBleedDmg = enemyBleedDmg

        // Apply bleed damage at start of turn
        if (enemyBleedDmg > 0) {
            newEnemyHP -= enemyBleedDmg
            message += `🩸 Pendarahan: ${enemyBleedDmg} dmg. `
            newBleedDmg = 0 // bleed lasts 1 turn
        }

        if (action === 'flee') {
            const fleeChance = (playerStats.speed + playerStats.dexterity) /
                (playerStats.speed + playerStats.dexterity + enemyStats.speed + enemyStats.dexterity) + 0.1
            if (Math.random() < fleeChance) {
                fled = true
                message += t('combat.fleeSuccess')
            } else {
                enemyDmg = calcDamage(enemyStats, playerStats)
                newPlayerHP -= enemyDmg
                message += t('combat.fleeFail', { dmg: String(enemyDmg) })
            }
        } else if (action.startsWith('special_')) {
            const moveId = action.replace('special_', '')
            const move = SPECIAL_MOVES.find(m => m.id === moveId)
            if (move) {
                if (move.effect === 'heal') {
                    // Heal move — restore HP
                    const healAmt = Math.floor(playerMaxHP * 0.15)
                    newPlayerHP = Math.min(playerMaxHP, newPlayerHP + healAmt)
                    message += `💚 ${move.label}: +${healAmt} HP. `
                } else {
                    // Offensive special move
                    const adjustedStats = {
                        ...playerStats,
                        speed: Math.ceil(playerStats.speed * (1 + move.accuracyModifier)),
                        dexterity: Math.ceil(playerStats.dexterity * (1 + move.accuracyModifier)),
                    }
                    playerDmg = calcDamage(adjustedStats, enemyStats, move.damageMultiplier)
                    if (playerDmg > 0) {
                        message += `⚡ ${move.label}: ${playerDmg} dmg! `
                        // Check for special effects
                        if (move.effect === 'stun' && move.effectChance && Math.random() < move.effectChance) {
                            newEnemyStunned = true
                            message += '💫 Musuh terkejut! '
                        }
                        if (move.effect === 'bleed' && move.effectChance && Math.random() < move.effectChance) {
                            newBleedDmg = Math.ceil(playerDmg * 0.3)
                            message += `🩸 Musuh berdarah (${newBleedDmg} dmg ronde depan)! `
                        }
                    } else {
                        message += `⚡ ${move.label} meleset! `
                    }
                }
                newEnemyHP -= playerDmg

                // Enemy attacks (if alive and not stunned)
                if (newEnemyHP > 0 && !newEnemyStunned && !enemyStunned) {
                    const defMultiplier = isDefending ? 2.0 : 1.0
                    const defendingPlayer = { ...playerStats, defense: Math.ceil(playerStats.defense * defMultiplier) }
                    enemyDmg = calcDamage(enemyStats, defendingPlayer)
                    newPlayerHP -= enemyDmg
                    message += enemyDmg > 0 ? t('combat.enemyHit', { dmg: String(enemyDmg) }) : t('combat.enemyMiss')
                } else if (newEnemyHP > 0 && (newEnemyStunned || enemyStunned)) {
                    message += ' Musuh terlalu terkejut untuk menyerang!'
                } else if (newEnemyHP <= 0) {
                    message += t('combat.enemyDefeated')
                }
                setIsDefending(false)
            }
        } else {
            if (action === 'attack') {
                playerDmg = calcDamage(playerStats, enemyStats, 1.0)
                message += playerDmg > 0
                    ? t('combat.attackHit', { dmg: String(playerDmg) })
                    : t('combat.attackMiss')
            } else if (action === 'heavy_attack') {
                const boosted = { ...playerStats, strength: Math.ceil(playerStats.strength * 1.8), speed: Math.ceil(playerStats.speed * 0.5) }
                playerDmg = calcDamage(boosted, enemyStats, 1.0)
                message += playerDmg > 0
                    ? t('combat.heavyHit', { dmg: String(playerDmg) })
                    : t('combat.heavyMiss')
            } else if (action === 'defend') {
                setIsDefending(true)
                message += t('combat.defending')
            }

            newEnemyHP -= playerDmg

            // Enemy counter attack (if alive and not stunned)
            if (newEnemyHP > 0 && !enemyStunned) {
                const defMultiplier = (action === 'defend' || isDefending) ? 2.0 : 1.0
                const defendingPlayer = {
                    ...playerStats,
                    defense: Math.ceil(playerStats.defense * defMultiplier),
                }
                enemyDmg = calcDamage(enemyStats, defendingPlayer)
                newPlayerHP -= enemyDmg
                message += enemyDmg > 0
                    ? action === 'defend'
                        ? t('combat.enemyHitDefend', { dmg: String(enemyDmg) })
                        : t('combat.enemyHit', { dmg: String(enemyDmg) })
                    : t('combat.enemyMiss')
            } else if (newEnemyHP > 0 && enemyStunned) {
                message += ' Musuh terlalu terkejut untuk menyerang!'
            } else {
                message += t('combat.enemyDefeated')
            }

            if (action !== 'defend') {
                setIsDefending(false)
            }
        }

        setEnemyStunned(newEnemyStunned)
        setEnemyBleedDmg(newBleedDmg)

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
                const res = await finishCombat(enemyId, false, totalDealt, totalTaken, Math.max(1, newPlayerHP), true)
                if ('error' in res) { onError(res.error ?? t('combat.error')); return }
                setResult({
                    won: false,
                    moneyEarned: 0,
                    xpEarned: 0,
                    leveledUp: false,
                    newLevel: playerLevel,
                    itemsDropped: [],
                    hospitalized: res.hospitalized,
                    hospitalSeconds: res.hospitalSeconds,
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
                    onError(res.error ?? t('combat.error'))
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
                // Auto-redirect to hospital if player was defeated
                if (res.hospitalized) {
                    setTimeout(() => router.push('/hospital'), 2500)
                }
            })
        }
    }, [playerHP, enemyHP, playerStats, enemyStats, enemyId, round, turnLog, isDefending, enemyStunned, enemyBleedDmg, playerLevel, playerMaxHP, router, onError, onPhaseChange, t])

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
        availableMoves,
        handleStartCombat,
        processTurn,
        resetCombat,
    }
}
