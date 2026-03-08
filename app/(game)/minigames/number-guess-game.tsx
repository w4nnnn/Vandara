'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DicesIcon } from 'lucide-react'

type NumberGuessGameProps = {
    guess: number
    onGuessChange: (n: number) => void
    onPlay: () => void
    isPending: boolean
}

export function NumberGuessGame({ guess, onGuessChange, onPlay, isPending }: NumberGuessGameProps) {
    return (
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
                        <button key={n} onClick={() => onGuessChange(n)}
                            className={`rounded-lg border p-2 text-sm font-bold transition-all ${guess === n ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'text-muted-foreground hover:bg-muted/50'}`}>
                            {n}
                        </button>
                    ))}
                </div>
                <Button onClick={onPlay} disabled={isPending} className="w-full">
                    Tebak!
                </Button>
            </CardContent>
        </Card>
    )
}
