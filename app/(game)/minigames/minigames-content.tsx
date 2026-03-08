'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TrophyIcon, XCircleIcon } from 'lucide-react'
import { playCoinFlip, playNumberGuess, playLockpick } from '@/app/actions/minigames'
import { CoinFlipGame } from './coin-flip-game'
import { NumberGuessGame } from './number-guess-game'
import { LockpickGame } from './lockpick-game'

export default function MinigamesContent({ player }: { player: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<any>(null)
    const [bet, setBet] = useState(100)
    const [choice, setChoice] = useState<'heads' | 'tails'>('heads')
    const [guess, setGuess] = useState(5)
    const [pins, setPins] = useState([1, 1, 1, 1])

    const handleCoinFlip = () => {
        startTransition(async () => {
            const res = await playCoinFlip(bet, choice)
            setResult({ game: 'coin_flip', ...res })
            router.refresh()
        })
    }

    const handleNumberGuess = () => {
        startTransition(async () => {
            const res = await playNumberGuess(bet, guess)
            setResult({ game: 'number_guess', ...res })
            router.refresh()
        })
    }

    const handleLockpick = () => {
        startTransition(async () => {
            const res = await playLockpick(bet, pins)
            setResult({ game: 'lockpick', ...res })
            router.refresh()
        })
    }

    return (
        <div className="space-y-6">
            {/* Result Banner */}
            {result && !result.error && (
                <Card className={`${result.won ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
                    <CardContent className="p-4 flex items-center gap-3">
                        {result.won ? (
                            <TrophyIcon className="size-6 text-green-500" />
                        ) : (
                            <XCircleIcon className="size-6 text-red-500" />
                        )}
                        <div>
                            <p className={`font-bold ${result.won ? 'text-green-500' : 'text-red-500'}`}>
                                {result.won ? `Menang! +$${result.payout}` : `Kalah! -$${result.lost}`}
                            </p>
                            {result.game === 'number_guess' && <p className="text-xs text-muted-foreground">Angka: {result.answer}</p>}
                            {result.game === 'lockpick' && <p className="text-xs text-muted-foreground">Pin benar: [{result.correctPins?.join(', ')}] — {result.matches}/4 cocok</p>}
                            {result.game === 'coin_flip' && <p className="text-xs text-muted-foreground">Hasil: {result.result === 'heads' ? 'Kepala' : 'Ekor'}</p>}
                        </div>
                    </CardContent>
                </Card>
            )}
            {result?.error && (
                <div className="text-sm text-center p-2 rounded-lg bg-red-500/10 text-red-500">{result.error}</div>
            )}

            {/* Bet Input */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Taruhan:</span>
                        <Input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="w-32" min={50} max={5000} />
                        <span className="text-xs text-muted-foreground">Saldo: ${Number(player.money).toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>

            <CoinFlipGame choice={choice} onChoiceChange={setChoice} onPlay={handleCoinFlip} isPending={isPending} />
            <NumberGuessGame guess={guess} onGuessChange={setGuess} onPlay={handleNumberGuess} isPending={isPending} />
            <LockpickGame pins={pins} onPinsChange={setPins} onPlay={handleLockpick} isPending={isPending}
                canPlay={player.currentLocation === 'dark_alley'} />
        </div>
    )
}
