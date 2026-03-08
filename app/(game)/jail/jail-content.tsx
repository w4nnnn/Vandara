'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  LockIcon, DumbbellIcon, HandCoinsIcon, SmileIcon, DoorOpenIcon,
  ZapIcon, ClockIcon, HistoryIcon,
} from 'lucide-react'
import { JAIL_ACTIVITIES } from '@/lib/game/constants'
import { getJailStatus, performJailActivity } from '@/app/actions/jail'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'

type Player = {
  id: number
  isJailed: boolean
  jailUntil: Date | null
  jailReason: string | null
  energy: number
}

const ACTIVITY_ICONS: Record<string, typeof DumbbellIcon> = {
  workout: DumbbellIcon,
  bribe_guard: HandCoinsIcon,
  good_behavior: SmileIcon,
  escape_attempt: DoorOpenIcon,
}

export default function JailContent({ player }: { player: Player }) {
  const router = useRouter()
  const { t } = useTranslation()
  const [isPending, startTransition] = useTransition()
  const [timeLeft, setTimeLeft] = useState(0)
  const [jailUntil, setJailUntil] = useState<Date | null>(player.jailUntil)
  const [isJailed, setIsJailed] = useState(player.isJailed)
  const [energy, setEnergy] = useState(player.energy)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [logs, setLogs] = useState<Array<{ id: number; reason: string; duration: number; reducedBy: number; createdAt: Date }>>([])

  useEffect(() => {
    getJailStatus().then(res => {
      if ('logs' in res) setLogs(res.logs ?? [])
    })
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!jailUntil) return
    const tick = () => {
      const diff = Math.max(0, Math.ceil((jailUntil.getTime() - Date.now()) / 1000))
      setTimeLeft(diff)
      if (diff <= 0) {
        setIsJailed(false)
        setJailUntil(null)
      }
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [jailUntil])

  const formatTime = useCallback((sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [])

  const handleActivity = (activityId: string) => {
    startTransition(async () => {
      const res = await performJailActivity(activityId)
      if (res.error) {
        toast.error(res.error)
        return
      }
      setMessage({ text: res.message!, type: res.success ? 'success' : 'error' })
      if (res.freed) {
        setIsJailed(false)
        setJailUntil(null)
        toast.success(res.message!)
        router.refresh()
      } else if (res.newJailUntil) {
        setJailUntil(new Date(res.newJailUntil))
      }
      // Refresh energy
      const status = await getJailStatus()
      if ('energy' in status) setEnergy(status.energy ?? 0)
      if ('logs' in status) setLogs(status.logs ?? [])
    })
  }

  // Player is not jailed
  if (!isJailed) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LockIcon className="size-5" />
              {t('jail.title')}
            </CardTitle>
            <CardDescription>{t('jail.freeDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription className="text-center text-green-400">
                {t('jail.notJailed')}
              </AlertDescription>
            </Alert>

            {logs.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <HistoryIcon className="size-4" /> {t('jail.history')}
                </h3>
                {logs.map(log => (
                  <div key={log.id} className="text-xs border rounded p-2 flex justify-between">
                    <span className="text-muted-foreground">{log.reason}</span>
                    <span>{log.duration}s{log.reducedBy > 0 && ` (-${log.reducedBy}s)`}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Player is jailed
  const totalDuration = jailUntil ? Math.ceil((jailUntil.getTime() - Date.now()) / 1000 + (logs[0]?.reducedBy ?? 0)) : 0
  const progress = totalDuration > 0 ? Math.max(0, 100 - (timeLeft / totalDuration) * 100) : 100

  return (
    <div className="space-y-6">
      {/* Timer */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <LockIcon className="size-5" />
            {t('jail.jailed')}
          </CardTitle>
          <CardDescription>{t('jail.reason')}: {player.jailReason ?? 'Unknown'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <ClockIcon className="size-4" /> {t('jail.remaining')}
            </span>
            <Badge variant="destructive" className="text-base font-mono">
              {formatTime(timeLeft)}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('jail.activities')}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <ZapIcon className="size-3" /> {t('jail.energyLeft')}: {energy}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {JAIL_ACTIVITIES.map(act => {
            const Icon = ACTIVITY_ICONS[act.id] ?? ZapIcon
            return (
              <div
                key={act.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <span className="font-medium text-sm">{act.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{act.description}</p>
                  <div className="flex gap-2 text-[10px]">
                    <Badge variant="outline">⚡ {act.energyCost}</Badge>
                    <Badge variant="outline">
                      {act.id === 'escape_attempt' ? '🏃 Kabur' : `⏱ -${act.reductionSeconds}s`}
                    </Badge>
                    <Badge variant="outline">🎯 {Math.round(act.chance * 100)}%</Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={act.id === 'escape_attempt' ? 'destructive' : 'default'}
                  disabled={isPending || energy < act.energyCost}
                  onClick={() => handleActivity(act.id)}
                >
                  {t('jail.doActivity')}
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
