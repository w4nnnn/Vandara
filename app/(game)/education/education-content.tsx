'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  GraduationCapIcon, ClockIcon, CoinsIcon, CheckCircleIcon,
  LockIcon, BookOpenIcon, TrendingUpIcon,
} from 'lucide-react'
import { COURSES } from '@/lib/game/constants'
import { enrollCourse, completeCourse, getEducationStatus } from '@/app/actions/education'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'

type Player = {
  level: number
  money: number
  activeCoursId: string | null
  courseFinishAt: Date | null
}

export default function EducationContent({ player }: { player: Player }) {
  const router = useRouter()
  const { t } = useTranslation()
  const [isPending, startTransition] = useTransition()
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [countdown, setCountdown] = useState(0)
  const [activeCourse, setActiveCourse] = useState(player.activeCoursId)
  const [finishAt, setFinishAt] = useState(player.courseFinishAt)

  // Load completed courses
  useEffect(() => {
    getEducationStatus().then(res => {
      if ('completedCourseIds' in res) {
        setCompletedIds(res.completedCourseIds ?? [])
      }
    })
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!finishAt) { setCountdown(0); return }
    const update = () => {
      const remaining = Math.max(0, new Date(finishAt).getTime() - Date.now())
      setCountdown(remaining)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [finishAt])

  const courseFinished = activeCourse && countdown <= 0
  const activeCourseData = COURSES.find(c => c.id === activeCourse)

  const handleEnroll = (courseId: string) => {
    startTransition(async () => {
      const res = await enrollCourse(courseId)
      if (res.error) {
        toast.error(res.error)
        return
      }
      setActiveCourse(courseId)
      setFinishAt(res.finishAt!)
      toast.success('Berhasil mendaftar kursus!')
      router.refresh()
    })
  }

  const handleComplete = () => {
    startTransition(async () => {
      const res = await completeCourse()
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`Kursus ${res.courseLabel} selesai! Bonus diterapkan.`)
      setActiveCourse(null)
      setFinishAt(null)
      setCompletedIds(prev => [...prev, activeCourse!])
      router.refresh()
    })
  }

  const formatTime = (ms: number) => {
    const totalSecs = Math.ceil(ms / 1000)
    const h = Math.floor(totalSecs / 3600)
    const m = Math.floor((totalSecs % 3600) / 60)
    const s = totalSecs % 60
    if (h > 0) return `${h}j ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  return (
    <div className="space-y-6">
      {/* Active Course */}
      {activeCourse && activeCourseData && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpenIcon className="size-5 text-blue-400" />
              {t('education.activeCourse')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{activeCourseData.label}</span>
              <Badge variant="outline" className="text-xs">
                <ClockIcon className="mr-1 size-3" />
                {courseFinished ? t('education.ready') : formatTime(countdown)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{activeCourseData.description}</p>
            {!courseFinished && (
              <Progress
                value={((activeCourseData.durationMinutes * 60 * 1000 - countdown) / (activeCourseData.durationMinutes * 60 * 1000)) * 100}
              />
            )}
            {courseFinished && (
              <Button onClick={handleComplete} disabled={isPending} className="w-full">
                <CheckCircleIcon className="mr-2 size-4" />
                {t('education.complete')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCapIcon className="size-5" />
            {t('education.title')}
          </CardTitle>
          <CardDescription>{t('education.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {COURSES.map(course => {
              const isCompleted = completedIds.includes(course.id)
              const isLocked = player.level < course.levelRequired
              const cantAfford = player.money < course.cost
              const isBusy = !!activeCourse

              return (
                <div
                  key={course.id}
                  className={`rounded-lg border p-4 space-y-2 ${isCompleted ? 'border-green-500/30 bg-green-500/5' : isLocked ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircleIcon className="size-4 text-green-500" />
                      ) : isLocked ? (
                        <LockIcon className="size-4 text-muted-foreground" />
                      ) : (
                        <BookOpenIcon className="size-4 text-blue-400" />
                      )}
                      <span className="font-medium text-sm">{course.label}</span>
                    </div>
                    {isCompleted ? (
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                        {t('education.completed')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Lv.{course.levelRequired}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{course.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="size-3" /> {course.durationMinutes}m
                    </span>
                    <span className="flex items-center gap-1">
                      <CoinsIcon className="size-3" /> ${course.cost.toLocaleString()}
                    </span>
                  </div>
                  {/* Rewards */}
                  <div className="flex flex-wrap gap-1.5">
                    {course.rewards.statBonus && Object.entries(course.rewards.statBonus).map(([stat, val]) => (
                      <Badge key={stat} variant="secondary" className="text-[10px]">
                        <TrendingUpIcon className="mr-0.5 size-2.5" /> +{val} {t(stat)}
                      </Badge>
                    ))}
                    {course.rewards.maxHealthBonus && (<Badge variant="secondary" className="text-[10px]">+{course.rewards.maxHealthBonus} Max HP</Badge>)}
                    {course.rewards.maxEnergyBonus && (<Badge variant="secondary" className="text-[10px]">+{course.rewards.maxEnergyBonus} Max Energy</Badge>)}
                    {course.rewards.maxNerveBonus && (<Badge variant="secondary" className="text-[10px]">+{course.rewards.maxNerveBonus} Max Nerve</Badge>)}
                    {course.rewards.maxHappyBonus && (<Badge variant="secondary" className="text-[10px]">+{course.rewards.maxHappyBonus} Max Happy</Badge>)}
                  </div>
                  {!isCompleted && !isLocked && !isBusy && (
                    <Button
                      size="sm"
                      onClick={() => handleEnroll(course.id)}
                      disabled={isPending || cantAfford}
                      className="w-full mt-1"
                    >
                      {cantAfford ? t('education.cantAfford') : t('education.enroll')}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
