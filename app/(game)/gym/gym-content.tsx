'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { trainGym } from '@/app/actions/gym'
import { GYM_EXERCISES, type GymStat } from '@/lib/game/constants'
import {
  SwordIcon,
  ShieldIcon,
  ZapIcon,
  TargetIcon,
  DumbbellIcon,
  HeartIcon,
  InfoIcon,
  BoltIcon
} from 'lucide-react'

type Player = {
  energy: number
  maxEnergy: number
  strength: number
  defense: number
  speed: number
  dexterity: number
}

const STAT_ICON: Record<GymStat, React.ElementType> = {
  strength: SwordIcon,
  defense: ShieldIcon,
  speed: ZapIcon,
  dexterity: TargetIcon,
}

const STAT_COLOR: Record<GymStat, string> = {
  strength: 'text-red-500',
  defense: 'text-blue-500',
  speed: 'text-yellow-500',
  dexterity: 'text-green-500',
}

const STAT_LABELS: GymStat[] = ['strength', 'defense', 'speed', 'dexterity']

export default function GymContent({ player }: { player: Player }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{
    stat?: string
    gained?: number
    error?: string
  } | null>(null)
  const [selectedStat, setSelectedStat] = useState<GymStat>('strength')

  const exercises = GYM_EXERCISES.filter((e) => e.stat === selectedStat)
  const energyPct = Math.round((player.energy / player.maxEnergy) * 100)

  async function handleTrain(exerciseId: string) {
    startTransition(async () => {
      const res = await trainGym(exerciseId)
      setResult(res)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Energy bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <BoltIcon className="size-4" /> Energy
            </span>
            <span className="text-muted-foreground">
              {player.energy} / {player.maxEnergy}
            </span>
          </div>
          <Progress value={energyPct} className="h-2.5" />
        </CardContent>
      </Card>

      {/* Current stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_LABELS.map((stat) => {
          const Icon = STAT_ICON[stat]
          return (
            <Card
              key={stat}
              className={`cursor-pointer transition-colors ${selectedStat === stat
                ? 'border-primary ring-1 ring-primary'
                : 'hover:border-muted-foreground/30'
                }`}
              onClick={() => setSelectedStat(stat)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <div className="rounded-md bg-muted p-2">
                  <Icon className={`size-4 ${STAT_COLOR[stat]}`} />
                </div>
                <div>
                  <p className="text-xs capitalize text-muted-foreground">
                    {stat}
                  </p>
                  <p className="text-lg font-bold">
                    {player[stat].toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Result toast */}
      {result && (
        <Card
          className={
            result.error
              ? 'border-destructive bg-destructive/10'
              : 'border-green-500 bg-green-500/10'
          }
        >
          <CardContent className="p-3 text-sm">
            {result.error ? (
              <span className="text-destructive">{result.error}</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">
                +{result.gained} <span className="capitalize">{result.stat}</span>!
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base capitalize">
            <DumbbellIcon className="size-4" />
            {selectedStat} Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-0.5">
                <p className="font-medium">{ex.label}</p>
                <p className="text-xs text-muted-foreground">
                  {ex.description}
                </p>
                <div className="flex gap-2 pt-1">
                  <Badge variant="secondary" className="text-xs">
                    +{ex.baseGain} {ex.stat}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <span className="flex items-center gap-1"><ZapIcon className="h-3 w-3 text-orange-400" /> {ex.energyCost} energy</span>
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                disabled={isPending || player.energy < ex.energyCost}
                onClick={() => handleTrain(ex.id)}
              >
                Train
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
