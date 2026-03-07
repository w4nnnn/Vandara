'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SwordsIcon, EyeIcon, CoinsIcon, SparklesIcon, LockIcon, CheckIcon, ZapIcon } from 'lucide-react'
import { unlockSkill } from '@/app/actions/skills'
import { SKILLS, type SkillTreeId, getSkillBonuses } from '@/lib/game/constants'

const TREE_INFO: Record<SkillTreeId, { label: string; icon: React.ElementType; color: string }> = {
    combat: { label: 'Pertarungan', icon: SwordsIcon, color: 'text-red-500' },
    stealth: { label: 'Siluman', icon: EyeIcon, color: 'text-emerald-500' },
    trading: { label: 'Perdagangan', icon: CoinsIcon, color: 'text-amber-500' },
}

export default function SkillsContent({ player }: { player: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [msg, setMsg] = useState<string | null>(null)

    const unlocked: string[] = useMemo(() => JSON.parse(player.unlockedSkills || '[]'), [player.unlockedSkills])
    const bonuses = useMemo(() => getSkillBonuses(unlocked), [unlocked])

    const handleUnlock = (skillId: string) => {
        setMsg(null)
        startTransition(async () => {
            const res = await unlockSkill(skillId)
            if (res.error) setMsg(res.error)
            else setMsg(`Skill "${res.skill?.label}" berhasil dibuka!`)
            router.refresh()
        })
    }

    return (
        <div className="space-y-6">
            {/* Skill Points Header */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
                <CardContent className="p-4 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="size-5 text-violet-500" />
                            <span className="font-semibold">Skill Points</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ZapIcon className="size-4 text-violet-500" />
                            <span className="text-2xl font-bold">{player.skillPoints}</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Dapatkan 1 skill point setiap naik level.</p>
                </CardContent>
            </Card>

            {msg && (
                <div className={`text-sm text-center p-2 rounded-lg ${msg.includes('berhasil') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {msg}
                </div>
            )}

            <Tabs defaultValue="combat">
                <TabsList className="w-full grid grid-cols-3">
                    {(Object.keys(TREE_INFO) as SkillTreeId[]).map(tree => {
                        const info = TREE_INFO[tree]
                        const Icon = info.icon
                        return (
                            <TabsTrigger key={tree} value={tree} className="text-xs">
                                <Icon className={`size-3 mr-1 ${info.color}`} />
                                {info.label}
                            </TabsTrigger>
                        )
                    })}
                </TabsList>

                {(Object.keys(TREE_INFO) as SkillTreeId[]).map(tree => {
                    const info = TREE_INFO[tree]
                    const treeSkills = SKILLS.filter(s => s.tree === tree)

                    return (
                        <TabsContent key={tree} value={tree}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className={`text-sm flex items-center gap-2 ${info.color}`}>
                                        <info.icon className="size-4" />
                                        Cabang {info.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {treeSkills.map(skill => {
                                        const isUnlocked = unlocked.includes(skill.id)
                                        const prereqMet = !skill.prerequisite || unlocked.includes(skill.prerequisite)
                                        const levelMet = player.level >= skill.levelRequired
                                        const canUnlock = !isUnlocked && prereqMet && levelMet && player.skillPoints >= skill.cost

                                        return (
                                            <div key={skill.id} className={`rounded-lg border p-3 ${isUnlocked ? 'border-green-500/50 bg-green-500/5' : !prereqMet ? 'opacity-40' : ''}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {isUnlocked ? (
                                                            <CheckIcon className="size-4 text-green-500" />
                                                        ) : !prereqMet ? (
                                                            <LockIcon className="size-4 text-muted-foreground" />
                                                        ) : (
                                                            <SparklesIcon className={`size-4 ${info.color}`} />
                                                        )}
                                                        <div>
                                                            <span className="font-medium text-sm">{skill.label}</span>
                                                            <p className="text-xs text-muted-foreground">{skill.description}</p>
                                                        </div>
                                                    </div>
                                                    {!isUnlocked && (
                                                        <Button size="sm" disabled={isPending || !canUnlock}
                                                            onClick={() => handleUnlock(skill.id)}
                                                            variant={canUnlock ? 'default' : 'outline'}>
                                                            {skill.cost} SP
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="flex gap-1.5 mt-2">
                                                    <Badge variant="outline" className="text-[10px]">Lv.{skill.levelRequired}</Badge>
                                                    {skill.prerequisite && (
                                                        <Badge variant="outline" className={`text-[10px] ${prereqMet ? 'border-green-500/30 text-green-500' : 'border-red-500/30 text-red-500'}`}>
                                                            Butuh: {SKILLS.find(s => s.id === skill.prerequisite)?.label}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )
                })}
            </Tabs>
        </div>
    )
}
