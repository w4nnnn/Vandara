'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircleIcon, ArrowLeftIcon, SwordsIcon } from 'lucide-react'
import type { ActiveNpc } from '@/lib/game/npc-generator'

type ChatMessage = { sender: 'npc' | 'player'; text: string }

type ChatWindowProps = {
    npc: ActiveNpc
    chatHistory: ChatMessage[]
    chatFinished: boolean
    currentReplies: string[]
    isPending: boolean
    isHospitalized: boolean
    playerHealth: number
    onBack: () => void
    onReply: (reply: string) => void
    onBackToNpcs: () => void
    onFight: () => void
    t: (key: string, params?: Record<string, string>) => string
}

export function ChatWindow({
    npc,
    chatHistory,
    chatFinished,
    currentReplies,
    isPending,
    isHospitalized,
    playerHealth,
    onBack,
    onReply,
    onBackToNpcs,
    onFight,
    t,
}: ChatWindowProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="size-8" onClick={onBack}>
                        <ArrowLeftIcon className="size-4" />
                    </Button>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MessageCircleIcon className="size-5" />
                        {t('npc.chatWith', { name: npc.label })}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Chat history */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {chatHistory.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'npc'
                                    ? 'bg-muted text-foreground rounded-bl-md'
                                    : 'bg-primary text-primary-foreground rounded-br-md'
                                    }`}
                            >
                                {msg.sender === 'npc' && (
                                    <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">
                                        {npc.label}
                                    </p>
                                )}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply options */}
                {!chatFinished && currentReplies.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                        <p className="text-xs text-muted-foreground">{t('npc.chooseReply')}</p>
                        {currentReplies.map((reply, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left h-auto py-2 text-sm whitespace-normal"
                                onClick={() => onReply(reply)}
                            >
                                {reply}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Chat finished */}
                {chatFinished && (
                    <div className="border-t pt-3 space-y-3">
                        <p className="text-sm text-muted-foreground text-center">
                            {t('npc.chatFinished')}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={onBackToNpcs}>
                                {t('npc.back')}
                            </Button>
                            <Button
                                onClick={onFight}
                                disabled={isPending || isHospitalized || playerHealth <= 0}
                            >
                                <SwordsIcon className="size-4 mr-2" />
                                {t('npc.challenge')}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
