'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    PackageIcon, ArrowLeftIcon, ArrowRightIcon, MousePointerClickIcon,
} from 'lucide-react'

type MiniGameType = 'pick_trash' | 'guess_direction' | 'quick_tap'

type ScavengeMiniGameProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    miniGameType: MiniGameType
    miniGameResult: 'playing' | 'won' | 'lost'
    miniGameData: any
    onPickTrash: (idx: number) => void
    onGuessDirection: (dir: 'left' | 'right') => void
    onQuickTap: () => void
}

export function ScavengeMiniGame({
    open,
    onOpenChange,
    miniGameType,
    miniGameResult,
    miniGameData,
    onPickTrash,
    onGuessDirection,
    onQuickTap,
}: ScavengeMiniGameProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {miniGameType === 'pick_trash' && '🗑️ Pilih Sampah!'}
                        {miniGameType === 'guess_direction' && '↔️ Tebak Arah!'}
                        {miniGameType === 'quick_tap' && '👆 Ketuk Cepat!'}
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="space-y-4">
                        {/* Result Banner */}
                        {miniGameResult !== 'playing' && (
                            <div className={`text-center p-3 rounded-lg font-bold text-sm animate-in fade-in zoom-in-95 ${miniGameResult === 'won' ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'
                                }`}>
                                {miniGameResult === 'won' ? '✨ Berhasil! Bonus loot +50%!' : '💨 Gagal! Loot normal...'}
                            </div>
                        )}

                        {/* Pick Trash Game */}
                        {miniGameType === 'pick_trash' && (
                            <div>
                                <p className="text-xs text-muted-foreground text-center mb-3">Pilih satu dari tiga tong. Satu berisi harta!</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {[0, 1, 2].map(idx => {
                                        const isRevealed = miniGameData.revealed
                                        const isCorrect = idx === miniGameData.correct
                                        const isPicked = idx === miniGameData.picked
                                        return (
                                            <button key={idx} onClick={() => onPickTrash(idx)}
                                                disabled={isRevealed}
                                                className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all duration-300 ${isRevealed && isCorrect ? 'border-green-500 bg-green-500/10 scale-110' :
                                                    isRevealed && isPicked && !isCorrect ? 'border-red-500 bg-red-500/10 scale-95' :
                                                        isRevealed ? 'opacity-40 scale-95' :
                                                            'border-muted hover:border-primary hover:bg-primary/5 cursor-pointer hover:scale-105 active:scale-95'
                                                    }`}>
                                                <PackageIcon className={`size-8 ${isRevealed && isCorrect ? 'text-green-500' : isRevealed && isPicked ? 'text-red-500' : 'text-muted-foreground'
                                                    }`} />
                                                <span className="text-xs font-medium">
                                                    {isRevealed && isCorrect ? '💰 Harta!' : isRevealed ? '💨 Kosong' : `Tong ${idx + 1}`}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Guess Direction Game */}
                        {miniGameType === 'guess_direction' && (
                            <div>
                                <p className="text-xs text-muted-foreground text-center mb-3">Loot tersembunyi! Tebak ke kiri atau kanan?</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {(['left', 'right'] as const).map(dir => {
                                        const isChosen = miniGameData.chosen === dir
                                        const isCorrect = miniGameData.correct === dir
                                        const revealed = miniGameData.chosen !== null
                                        return (
                                            <button key={dir} onClick={() => onGuessDirection(dir)}
                                                disabled={revealed}
                                                className={`rounded-xl border-2 p-6 flex flex-col items-center gap-2 transition-all duration-300 ${revealed && isCorrect ? 'border-green-500 bg-green-500/10 scale-105' :
                                                    revealed && isChosen && !isCorrect ? 'border-red-500 bg-red-500/10 scale-95' :
                                                        revealed ? 'opacity-40' :
                                                            'border-muted hover:border-primary hover:bg-primary/5 cursor-pointer hover:scale-105 active:scale-95'
                                                    }`}>
                                                {dir === 'left' ? (
                                                    <ArrowLeftIcon className={`size-10 ${revealed && isCorrect ? 'text-green-500' : revealed && isChosen ? 'text-red-500' : 'text-muted-foreground'}`} />
                                                ) : (
                                                    <ArrowRightIcon className={`size-10 ${revealed && isCorrect ? 'text-green-500' : revealed && isChosen ? 'text-red-500' : 'text-muted-foreground'}`} />
                                                )}
                                                <span className="text-sm font-medium">{dir === 'left' ? 'Kiri' : 'Kanan'}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quick Tap Game */}
                        {miniGameType === 'quick_tap' && (
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground text-center">Ketuk tombol 10 kali dalam 3 detik!</p>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Ketukan: <strong>{miniGameData.taps ?? 0}</strong>/10</span>
                                    <span className={`font-mono ${(miniGameData.timeLeft ?? 3) <= 1 ? 'text-red-500' : ''}`}>
                                        {(miniGameData.timeLeft ?? 3).toFixed(1)}s
                                    </span>
                                </div>
                                <Progress value={((miniGameData.taps ?? 0) / 10) * 100} className="h-2" />
                                <button onClick={onQuickTap}
                                    disabled={miniGameResult !== 'playing'}
                                    className={`w-full rounded-xl border-2 p-8 flex flex-col items-center gap-2 transition-all ${miniGameResult === 'playing' ? 'border-primary bg-primary/5 hover:bg-primary/10 cursor-pointer active:scale-95 active:bg-primary/20' :
                                        miniGameResult === 'won' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
                                        }`}>
                                    <MousePointerClickIcon className={`size-10 ${miniGameResult === 'playing' ? 'text-primary animate-pulse' : miniGameResult === 'won' ? 'text-green-500' : 'text-red-500'
                                        }`} />
                                    <span className="text-sm font-bold">
                                        {miniGameResult === 'playing' ? 'KETUK!' : miniGameResult === 'won' ? '✨ Berhasil!' : '💨 Waktu habis!'}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    )
}
