'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DicesIcon, CoinsIcon, KeyRoundIcon, TrophyIcon, XCircleIcon } from 'lucide-react'
import { playCoinFlip, playNumberGuess, playLockpick } from '@/app/actions/minigames'
import { MINI_GAMES } from '@/lib/game/constants'

const GAME_ICONS: Record<string, React.ElementType> = {
    coin_flip: CoinsIcon, number_guess: DicesIcon, lockpick: KeyRoundIcon,
}

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

            {/* Coin Flip */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <CoinsIcon className="size-4 text-yellow-500" /> Lempar Koin
                    </CardTitle>
                    <CardDescription className="text-xs">Menang = 2x taruhan. Nerve: 1</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3">
                    <div className="flex gap-2">
                        <button onClick={() => setChoice('heads')}
                            className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-all ${choice === 'heads' ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                            Kepala
                        </button>
                        <button onClick={() => setChoice('tails')}
                            className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-all ${choice === 'tails' ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                            Ekor
                        </button>
                    </div>
                    <Button onClick={handleCoinFlip} disabled={isPending} className="w-full">
                        Lempar Koin
                    </Button>
                </CardContent>
            </Card>

            {/* Number Guess */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <DicesIcon className="size-4 text-blue-500" /> Tebak Angka
                    </CardTitle>
                    <CardDescription className="text-xs">Tebak 1-10. Tepat = 8x taruhan. Nerve: 2</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3">
                    <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                            <button key={n} onClick={() => setGuess(n)}
                                className={`rounded-lg border p-2 text-sm font-bold transition-all ${guess === n ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'text-muted-foreground hover:bg-muted/50'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                    <Button onClick={handleNumberGuess} disabled={isPending} className="w-full">
                        Tebak!
                    </Button>
                </CardContent>
            </Card>

            {/* Lockpick */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <KeyRoundIcon className="size-4 text-emerald-500" /> Bongkar Kunci
                    </CardTitle>
                    <CardDescription className="text-xs">Pilih 4 pin (1-5). 3 cocok = 2x, 4 cocok = 5x. Nerve: 3. Dark Alley saja.</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3">
                    <div className="flex gap-2">
                        {pins.map((pin, i) => (
                            <div key={i} className="flex-1">
                                <p className="text-[10px] text-muted-foreground text-center mb-1">Pin {i + 1}</p>
                                <div className="flex flex-col gap-1">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} onClick={() => { const np = [...pins]; np[i] = n; setPins(np) }}
                                            className={`rounded border px-2 py-1 text-xs font-bold transition-all ${pin === n ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground'}`}>
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleLockpick} disabled={isPending || player.currentLocation !== 'dark_alley'} className="w-full">
                        {player.currentLocation !== 'dark_alley' ? 'Harus di Dark Alley' : 'Bongkar!'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
