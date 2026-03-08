'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KeyRoundIcon } from 'lucide-react'

type LockpickGameProps = {
    pins: number[]
    onPinsChange: (pins: number[]) => void
    onPlay: () => void
    isPending: boolean
    canPlay: boolean
}

export function LockpickGame({ pins, onPinsChange, onPlay, isPending, canPlay }: LockpickGameProps) {
    return (
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
                                    <button key={n} onClick={() => { const np = [...pins]; np[i] = n; onPinsChange(np) }}
                                        className={`rounded border px-2 py-1 text-xs font-bold transition-all ${pin === n ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground'}`}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <Button onClick={onPlay} disabled={isPending || !canPlay} className="w-full">
                    {!canPlay ? 'Harus di Dark Alley' : 'Bongkar!'}
                </Button>
            </CardContent>
        </Card>
    )
}
