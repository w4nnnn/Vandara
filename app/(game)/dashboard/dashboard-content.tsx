'use client'

import Link from 'next/link'
import AvatarComponent from '@/avataaars-assets'
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
}: {
  label: string
  value: number
  icon: React.ElementType
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="rounded-md bg-muted p-2">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value.toLocaleString()}</p>
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
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          {player.avatar && (
            <div className="shrink-0">
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
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">{player.name}</h2>
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
            <p className="text-xs text-muted-foreground">{t('balance')}</p>
            <p className="text-2xl font-bold text-primary">
              ${Number(player.money).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Bars — Real-time Regen */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('status')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RegenTimer player={player} />
        </CardContent>
      </Card>

      {/* Battle Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('dashboard.battleStats')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <BattleStat
              label={t('strength')}
              value={player.strength}
              icon={SwordIcon}
            />
            <BattleStat
              label={t('defense')}
              value={player.defense}
              icon={ShieldIcon}
            />
            <BattleStat
              label={t('speed')}
              value={player.speed}
              icon={ZapIcon}
            />
            <BattleStat
              label={t('dexterity')}
              value={player.dexterity}
              icon={TargetIcon}
            />
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
