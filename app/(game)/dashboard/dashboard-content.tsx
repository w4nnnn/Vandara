'use client'

import Link from 'next/link'
import AvatarComponent from '@/lib/avataaars'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { xpForLevel } from '@/lib/game/constants'
import RegenTimer from '@/components/game/regen-timer'
import {
  ShieldIcon,
  SwordIcon,
  TargetIcon,
  SwordsIcon,
  BriefcaseIcon,
  HeartPulseIcon,
  MapPinIcon,
  SparklesIcon,
  DollarSignIcon,
  TrendingUpIcon,
  AwardIcon,
  BrainIcon,
  CrosshairIcon,
  FootprintsIcon,
  ShieldCheckIcon,
  FlameIcon,
  StarIcon,
  SmileIcon,
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
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  luck: number
  perception: number
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
  derivedStats: {
    maxHealth: number
    maxEnergy: number
    maxNerve: number
    maxHappy: number
    critChance: number
    dodgeChance: number
    accuracy: number
    blockChance: number
  }
  activeSynergies: Array<{
    id: string
    tier: number
    label: string
    bonus: {
      meleeDamage?: number
      critChance?: number
      maxHp?: number
      lootQuality?: number
      energyCost?: number
      attack?: number
      defense?: number
      blockChance?: number
      dodgeChance?: number
      critDamage?: number
      accuracy?: number
    }
  }>
}

const STAT_CONFIG = {
  strength:     { abbr: 'STR', color: 'text-red-500',    bg: 'bg-red-500/10',    icon: SwordIcon },
  dexterity:    { abbr: 'DEX', color: 'text-green-500',  bg: 'bg-green-500/10',  icon: TargetIcon },
  constitution: { abbr: 'CON', color: 'text-blue-500',   bg: 'bg-blue-500/10',   icon: ShieldIcon },
  intelligence: { abbr: 'INT', color: 'text-cyan-500',   bg: 'bg-cyan-500/10',   icon: BrainIcon },
  wisdom:       { abbr: 'WIS', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: StarIcon },
  charisma:     { abbr: 'CHA', color: 'text-pink-400',   bg: 'bg-pink-400/10',   icon: SmileIcon },
  luck:         { abbr: 'LCK', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: SparklesIcon },
  perception:   { abbr: 'PER', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: CrosshairIcon },
} as const

const STAT_CATEGORIES = [
  { label: 'Fisik',   stats: ['strength', 'dexterity', 'constitution'] as const },
  { label: 'Mental',  stats: ['intelligence', 'wisdom'] as const },
  { label: 'Spesial', stats: ['charisma', 'luck', 'perception'] as const },
]

function StatPill({ abbr, value, color, bg, icon: Icon }: {
  abbr: string; value: number; color: string; bg: string; icon: React.ElementType
}) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg ${bg} px-2.5 py-1.5 transition-colors`}>
      <Icon className={`size-3.5 ${color}`} />
      <span className={`text-xs font-semibold ${color}`}>{abbr}</span>
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </div>
  )
}

function SynergyBadge({ synergy }: { synergy: { id: string; tier: number; label: string } }) {
  const synergyInfo: Record<string, { color: string; icon: string }> = {
    warrior:   { color: 'bg-red-500/10 text-red-500 border-red-500/30', icon: '⚔️' },
    shadow:    { color: 'bg-purple-500/10 text-purple-500 border-purple-500/30', icon: '🗡️' },
    tank:      { color: 'bg-blue-500/10 text-blue-500 border-blue-500/30', icon: '🛡️' },
    scholar:   { color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30', icon: '📚' },
    survivor:  { color: 'bg-green-500/10 text-green-500 border-green-500/30', icon: '🎒' },
    hustler:   { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30', icon: '💰' },
    sentinel:  { color: 'bg-orange-500/10 text-orange-500 border-orange-500/30', icon: '👁️' },
    trickster: { color: 'bg-pink-500/10 text-pink-500 border-pink-500/30', icon: '🎲' },
  }

  const info = synergyInfo[synergy.id] || { color: 'bg-primary/10 text-primary border-primary/30', icon: '✨' }
  const tierLabel = synergy.tier > 0 ? ` T${synergy.tier}` : ''

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium ${info.color}`}>
      <span>{info.icon}</span>
      <span>{synergy.label}{tierLabel}</span>
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

      {/* Stats & Combat */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <SwordsIcon className="size-4" />
            {t('dashboard.battleStats')}
            {player.activeSynergies.length > 0 && (
              <Badge variant="outline" className="ml-auto text-[10px] border-primary/50 text-primary">
                <FlameIcon className="size-3 mr-1" />
                {player.activeSynergies.length} sinergi
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Stats — grouped by category */}
          <div className="space-y-2.5">
            {STAT_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{cat.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.stats.map((key) => {
                    const cfg = STAT_CONFIG[key]
                    return (
                      <StatPill
                        key={key}
                        abbr={cfg.abbr}
                        value={player[key]}
                        color={cfg.color}
                        bg={cfg.bg}
                        icon={cfg.icon}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Combat Derived Stats */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tempur</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
              <div className="flex items-center gap-1.5">
                <CrosshairIcon className="size-3.5 text-purple-500" />
                <span className="text-xs text-muted-foreground">Crit</span>
                <span className="ml-auto text-xs font-bold tabular-nums">{Math.round(player.derivedStats.critChance)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FootprintsIcon className="size-3.5 text-green-500" />
                <span className="text-xs text-muted-foreground">Dodge</span>
                <span className="ml-auto text-xs font-bold tabular-nums">{Math.round(player.derivedStats.dodgeChance)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TargetIcon className="size-3.5 text-orange-500" />
                <span className="text-xs text-muted-foreground">Accuracy</span>
                <span className="ml-auto text-xs font-bold tabular-nums">{Math.round(player.derivedStats.accuracy)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="size-3.5 text-cyan-500" />
                <span className="text-xs text-muted-foreground">Block</span>
                <span className="ml-auto text-xs font-bold tabular-nums">{Math.round(player.derivedStats.blockChance)}%</span>
              </div>
            </div>
          </div>

          {/* Active Synergies (inline) */}
          {player.activeSynergies.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-1.5">
                {player.activeSynergies.map((synergy) => (
                  <SynergyBadge key={synergy.id} synergy={synergy} />
                ))}
              </div>
            </>
          )}
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
