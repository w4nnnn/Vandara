'use server'

import { db } from '@/lib/db'
import { players } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getPlayer } from './character'
import { MINI_GAMES, type LocationId } from '@/lib/game/constants'
import { addReputation } from './reputation'

export async function playCoinFlip(bet: number, choice: 'heads' | 'tails') {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const game = MINI_GAMES.find(g => g.id === 'coin_flip')!
    if (player.nerve < game.nerveCost) return { error: `Butuh ${game.nerveCost} nerve` }
    if (bet < game.minBet || bet > game.maxBet) return { error: `Taruhan harus antara $${game.minBet} - $${game.maxBet}` }
    if (player.money < bet) return { error: 'Uang tidak cukup' }

    const result = Math.random() < 0.5 ? 'heads' : 'tails'
    const won = result === choice
    const payout = won ? bet : -bet

    await db.update(players).set({
        money: player.money + payout,
        nerve: player.nerve - game.nerveCost,
        updatedAt: new Date(),
    }).where(eq(players.id, player.id))

    if (won) {
        await addReputation(player.id, player.currentLocation as LocationId, 1)
    }

    return { success: true, won, result, payout: won ? bet : 0, lost: won ? 0 : bet }
}

export async function playNumberGuess(bet: number, guess: number) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const game = MINI_GAMES.find(g => g.id === 'number_guess')!
    if (player.nerve < game.nerveCost) return { error: `Butuh ${game.nerveCost} nerve` }
    if (bet < game.minBet || bet > game.maxBet) return { error: `Taruhan harus antara $${game.minBet} - $${game.maxBet}` }
    if (player.money < bet) return { error: 'Uang tidak cukup' }
    if (guess < 1 || guess > 10) return { error: 'Tebak angka 1-10' }

    const answer = Math.floor(Math.random() * 10) + 1
    const won = answer === guess
    const payout = won ? bet * 8 : -bet

    await db.update(players).set({
        money: player.money + payout,
        nerve: player.nerve - game.nerveCost,
        updatedAt: new Date(),
    }).where(eq(players.id, player.id))

    if (won) {
        await addReputation(player.id, player.currentLocation as LocationId, 3)
    }

    return { success: true, won, answer, payout: won ? bet * 8 : 0, lost: won ? 0 : bet }
}

export async function playLockpick(bet: number, pins: number[]) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const game = MINI_GAMES.find(g => g.id === 'lockpick')!
    if (game.locationId && player.currentLocation !== game.locationId) return { error: 'Harus di Dark Alley' }
    if (player.nerve < game.nerveCost) return { error: `Butuh ${game.nerveCost} nerve` }
    if (bet < game.minBet || bet > game.maxBet) return { error: `Taruhan harus antara $${game.minBet} - $${game.maxBet}` }
    if (player.money < bet) return { error: 'Uang tidak cukup' }

    // Generate 4 pins (1-5), player guesses 4 pins
    const correctPins = Array.from({ length: 4 }, () => Math.floor(Math.random() * 5) + 1)
    const correct = pins.length === 4 && pins.every((p, i) => p === correctPins[i])

    // Partial credit: count matching positions
    const matches = pins.filter((p, i) => i < 4 && p === correctPins[i]).length
    const won = matches >= 3 // 3 or 4 correct = win
    const multiplier = matches === 4 ? 5 : matches === 3 ? 2 : 0
    const payout = won ? bet * multiplier : -bet

    await db.update(players).set({
        money: player.money + payout,
        nerve: player.nerve - game.nerveCost,
        updatedAt: new Date(),
    }).where(eq(players.id, player.id))

    if (won) {
        await addReputation(player.id, 'dark_alley', 5)
    }

    return { success: true, won, correctPins, matches, payout: won ? bet * multiplier : 0, lost: won ? 0 : bet }
}
