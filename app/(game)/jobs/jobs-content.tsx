'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { applyForJob, quitJob, work } from '@/app/actions/jobs'
import { JOBS } from '@/lib/game/constants'
import {
  BriefcaseIcon,
  BrainIcon,
  CheckCircleIcon,
  LockIcon,
  ArrowRightIcon,
  CoinsIcon,
  StarIcon,
  PartyPopperIcon,
} from 'lucide-react'

type Player = {
  level: number
  nerve: number
  maxNerve: number
  money: number | bigint
  jobId: string | null
}

export default function JobsContent({ player }: { player: Player }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{
    error?: string
    success?: boolean
    moneyEarned?: number
    xpEarned?: number
    leveledUp?: boolean
    newLevel?: number
  } | null>(null)

  const currentJob = JOBS.find((j) => j.id === player.jobId)
  const nervePct = Math.round((player.nerve / player.maxNerve) * 100)

  function handleApply(jobId: string) {
    startTransition(async () => {
      const res = await applyForJob(jobId)
      if (res.error) setResult(res)
      else setResult(null)
      router.refresh()
    })
  }

  function handleQuit() {
    startTransition(async () => {
      await quitJob()
      setResult(null)
      router.refresh()
    })
  }

  function handleWork() {
    startTransition(async () => {
      const res = await work()
      setResult(res)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Nerve bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <BrainIcon className="size-4" /> Nerve
            </span>
            <span className="text-muted-foreground">
              {player.nerve} / {player.maxNerve}
            </span>
          </div>
          <Progress value={nervePct} className="h-2.5" />
        </CardContent>
      </Card>

      {/* Current Job */}
      {currentJob && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BriefcaseIcon className="size-4" />
              Current Job
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{currentJob.label}</p>
                <p className="text-sm text-muted-foreground">
                  {currentJob.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs mt-1">
                  <Badge variant="secondary" className="flex items-center gap-1"><CoinsIcon className="h-3 w-3" /> ${currentJob.pay}</Badge>
                  <Badge variant="secondary" className="flex items-center gap-1"><StarIcon className="h-3 w-3" /> {currentJob.xp} XP</Badge>
                  <Badge variant="outline" className="flex items-center gap-1"><BrainIcon className="h-3 w-3" /> {currentJob.nerveCost} nerve</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleWork}
                disabled={isPending || player.nerve < currentJob.nerveCost}
              >
                Work
              </Button>
              <Button variant="outline" onClick={handleQuit} disabled={isPending}>
                Quit Job
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                Earned ${result.moneyEarned} and {result.xpEarned} XP!
                <br />
                {result.leveledUp && (
                  <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 mt-1">
                    <PartyPopperIcon className="h-4 w-4" /> Level up! You are now level {result.newLevel}!
                  </span>
                )}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Jobs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BriefcaseIcon className="size-4" />
            Available Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {JOBS.map((job) => {
            const locked = player.level < job.levelRequired
            const isCurrent = player.jobId === job.id
            return (
              <div
                key={job.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${locked ? 'opacity-50' : ''
                  } ${isCurrent ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{job.label}</p>
                    {isCurrent && (
                      <CheckCircleIcon className="size-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CoinsIcon className="h-3 w-3" /> ${job.pay}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <StarIcon className="h-3 w-3" /> {job.xp} XP
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <BrainIcon className="h-3 w-3" /> {job.nerveCost} nerve
                    </Badge>
                    {locked && (
                      <Badge variant="destructive" className="text-xs">
                        <LockIcon className="mr-1 size-3" />
                        Lv.{job.levelRequired}
                      </Badge>
                    )}
                  </div>
                </div>
                {!locked && !isCurrent && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleApply(job.id)}
                  >
                    Apply <ArrowRightIcon className="ml-1 size-3" />
                  </Button>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
