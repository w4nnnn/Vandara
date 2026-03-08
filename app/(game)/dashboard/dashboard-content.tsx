'use client'

import Link from 'next/link'
import AvatarComponent from '@/lib/avataaars'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { xpForLevel } from '@/lib/game/constants'
import RegenTimer from '@/components/game/regen-timer'
import {
  ShieldIcon,
  SwordIcon,
  ZapIcon,
  TargetIcon,
  SwordsIcon,
  DumbbellIcon,
  BriefcaseIcon,
  BackpackIcon,
  HeartPulseIcon,
  PlaneIcon,
  MapPinIcon,
  UsersIcon,
  SparklesIcon,
  DollarSignIcon,
  TrendingUpIcon,
  AwardIcon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LOCATIONS, type LocationId } from '@/lib/game/constants'
import { useTranslation } from '@/lib/i18n'

type Player = {
  id: number
  name: string
  level: number
  experience: number
  money: number | bigint
  energy: number
  maxEnergy: number
  nerve: number
  maxNerve: number
  health: number
  maxHealth: number
  happy: number
  maxHappy: number
  strength: number
  defense: number
  speed: number
  dexterity: number
  isHospitalized: boolean
  hospitalUntil: Date | null
  currentLocation: string
  travelingTo: string | null
  updatedAt: Date
  avatar?: {
    avatarStyle: string
    topType: string
    accessoriesType: string
    hatColor: string
    hairColor: string
    facialHairType: string
    facialHairColor: string
    clotheType: string
    clotheColor: string
    graphicType: string
    eyeType: string
    eyebrowType: string
    mouthType: string
    skinColor: string
  } | null
}



function BattleStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/30">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
      <div className="relative flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 group-hover:scale-110 transition-transform duration-200">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

export default function DashboardContent({ player }: { player: Player }) {
  const { t } = useTranslation()
  const xpNeeded = xpForLevel(player.level + 1)
  const xpPct = Math.min(
    Math.round((player.experience / xpNeeded) * 100),
    100
  )

  return (
    <div className="space-y-6">
      {/* Hospital Alert */}
      {player.isHospitalized && (
        <Alert variant="destructive">
          <HeartPulseIcon className="size-4" />
          <AlertTitle>{t('dashboard.hospitalized')}</AlertTitle>
          <AlertDescription>
            {t('dashboard.hospitalizedDesc')}
            <Link href="/hospital" className="ml-1 underline font-medium">
              {t('dashboard.viewHospital')}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Player Info */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <CardContent className="relative flex items-center gap-4 p-5">
          {player.avatar && (
            <div className="shrink-0 relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" />
              <div className="relative">
                <AvatarComponent
                  avatarStyle={player.avatar.avatarStyle}
                  topType={player.avatar.topType}
                  accessoriesType={player.avatar.accessoriesType}
                  hatColor={player.avatar.hatColor}
                  hairColor={player.avatar.hairColor}
                  facialHairType={player.avatar.facialHairType}
                  facialHairColor={player.avatar.facialHairColor}
                  clotheType={player.avatar.clotheType}
                  clotheColor={player.avatar.clotheColor}
                  graphicType={player.avatar.graphicType}
                  eyeType={player.avatar.eyeType}
                  eyebrowType={player.avatar.eyebrowType}
                  mouthType={player.avatar.mouthType}
                  skinColor={player.avatar.skinColor}
                  style={{ width: '80px', height: '80px' }}
                />
              </div>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {player.name}
              <AwardIcon className="size-4 text-primary" />
            </h2>
            <p className="text-sm text-muted-foreground">
              Level {player.level}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPinIcon className="size-3" />
              {t(`loc.${player.currentLocation}`) || player.currentLocation}
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>XP</span>
                <span>
                  {player.experience.toLocaleString()} /{' '}
                  {xpNeeded.toLocaleString()}
                </span>
              </div>
              <Progress value={xpPct} className="h-2" />
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end text-xs text-muted-foreground mb-1">
              <DollarSignIcon className="size-3" />
              {t('balance')}
            </div>
            <p className="text-2xl font-bold text-primary">
              ${Number(player.money).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Bars — Real-time Regen */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
        <CardHeader className="pb-3 relative">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUpIcon className="size-4" />
            {t('status')}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <RegenTimer player={player} />
        </CardContent>
      </Card>

      {/* Battle Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <SwordsIcon className="size-4" />
            {t('dashboard.battleStats')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <BattleStat
              label={t('strength')}
              value={player.strength}
              icon={SwordIcon}
              color="from-red-500/5 to-transparent"
            />
            <BattleStat
              label={t('defense')}
              value={player.defense}
              icon={ShieldIcon}
              color="from-blue-500/5 to-transparent"
            />
            <BattleStat
              label={t('speed')}
              value={player.speed}
              icon={ZapIcon}
              color="from-yellow-500/5 to-transparent"
            />
            <BattleStat
              label={t('dexterity')}
              value={player.dexterity}
              icon={TargetIcon}
              color="from-green-500/5 to-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions — features not tied to a location */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
        <CardHeader className="pb-3 relative">
          <CardTitle className="text-base flex items-center gap-2">
            <BriefcaseIcon className="size-4" />
            {t('dashboard.quickActions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/skills" className="group flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 hover:shadow-lg hover:border-purple-500/30 hover:bg-purple-500/5">
              <div className="rounded-full bg-purple-500/10 p-3 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-200">
                <SparklesIcon className="size-5 text-purple-500" />
              </div>
              <span className="text-xs font-medium">Skills</span>
            </Link>
            <Link href="/equipment" className="group flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 hover:shadow-lg hover:border-orange-500/30 hover:bg-orange-500/5">
              <div className="rounded-full bg-orange-500/10 p-3 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-200">
                <SwordIcon className="size-5 text-orange-500" />
              </div>
              <span className="text-xs font-medium">Equipment</span>
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
