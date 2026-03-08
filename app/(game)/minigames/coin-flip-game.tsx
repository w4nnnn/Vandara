'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CoinsIcon } from 'lucide-react'

type CoinFlipGameProps = {
    choice: 'heads' | 'tails'
    onChoiceChange: (choice: 'heads' | 'tails') => void
    onPlay: () => void
    isPending: boolean
}

export function CoinFlipGame({ choice, onChoiceChange, onPlay, isPending }: CoinFlipGameProps) {
    return (
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
                    <button onClick={() => onChoiceChange('heads')}
                        className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-all ${choice === 'heads' ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                        Kepala
                    </button>
                    <button onClick={() => onChoiceChange('tails')}
                        className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-all ${choice === 'tails' ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                        Ekor
                    </button>
                </div>
                <Button onClick={onPlay} disabled={isPending} className="w-full">
                    Lempar Koin
                </Button>
            </CardContent>
        </Card>
    )
}
