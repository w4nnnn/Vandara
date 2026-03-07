/**
 * Server-side stat regeneration.
 * Calculates how much energy/nerve/health/happy should have been
 * regenerated since the last DB update, and returns patched values.
 */

import {
    ENERGY_REGEN_RATE,
    ENERGY_REGEN_INTERVAL_MS,
    NERVE_REGEN_RATE,
    NERVE_REGEN_INTERVAL_MS,
    HEALTH_REGEN_RATE,
    HEALTH_REGEN_INTERVAL_MS,
    HAPPY_REGEN_RATE,
    HAPPY_REGEN_INTERVAL_MS,
} from './constants'

type RegenStat = {
    current: number
    max: number
    rate: number
    intervalMs: number
}

function regenAmount(elapsed: number, stat: RegenStat): number {
    if (stat.current >= stat.max) return 0
    const ticks = Math.floor(elapsed / stat.intervalMs)
    if (ticks <= 0) return 0
    const gained = ticks * stat.rate
    return Math.min(gained, stat.max - stat.current)
}

export type PlayerForRegen = {
    energy: number
    maxEnergy: number
    nerve: number
    maxNerve: number
    health: number
    maxHealth: number
    happy: number
    maxHappy: number
    updatedAt: Date
}

export type RegenResult = {
    energy: number
    nerve: number
    health: number
    happy: number
    changed: boolean
}

export function applyRegen(player: PlayerForRegen, now: Date = new Date()): RegenResult {
    const elapsed = now.getTime() - player.updatedAt.getTime()
    if (elapsed <= 0) {
        return {
            energy: player.energy,
            nerve: player.nerve,
            health: player.health,
            happy: player.happy,
            changed: false,
        }
    }

    const energyGain = regenAmount(elapsed, {
        current: player.energy,
        max: player.maxEnergy,
        rate: ENERGY_REGEN_RATE,
        intervalMs: ENERGY_REGEN_INTERVAL_MS,
    })

    const nerveGain = regenAmount(elapsed, {
        current: player.nerve,
        max: player.maxNerve,
        rate: NERVE_REGEN_RATE,
        intervalMs: NERVE_REGEN_INTERVAL_MS,
    })

    const healthGain = regenAmount(elapsed, {
        current: player.health,
        max: player.maxHealth,
        rate: HEALTH_REGEN_RATE,
        intervalMs: HEALTH_REGEN_INTERVAL_MS,
    })

    const happyGain = regenAmount(elapsed, {
        current: player.happy,
        max: player.maxHappy,
        rate: HAPPY_REGEN_RATE,
        intervalMs: HAPPY_REGEN_INTERVAL_MS,
    })

    const changed = energyGain > 0 || nerveGain > 0 || healthGain > 0 || happyGain > 0

    return {
        energy: player.energy + energyGain,
        nerve: player.nerve + nerveGain,
        health: player.health + healthGain,
        happy: player.happy + happyGain,
        changed,
    }
}
