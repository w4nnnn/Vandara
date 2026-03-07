'use client'

import AvatarComponent from '@/avataaars-assets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { xpForLevel } from '@/lib/game/constants'
import {
  ShieldIcon,
  SwordIcon,
  ZapIcon,
  TargetIcon,
  HeartIcon,
  BoltIcon,
  BrainIcon,
  SmileIcon,
} from 'lucide-react'

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

function StatBar({
  label,
  value,
  max,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  max: number
  icon: React.ElementType
  color: string
}) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className="text-muted-foreground">
          {value} / {max}
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
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
  const xpNeeded = xpForLevel(player.level + 1)
  const xpPct = Math.min(
    Math.round((player.experience / xpNeeded) * 100),
    100
  )

  return (
    <div className="space-y-6">
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
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold text-primary">
              ${Number(player.money).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Bars */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatBar
            label="Health"
            value={player.health}
            max={player.maxHealth}
            icon={HeartIcon}
            color="bg-red-500"
          />
          <StatBar
            label="Energy"
            value={player.energy}
            max={player.maxEnergy}
            icon={BoltIcon}
            color="bg-green-500"
          />
          <StatBar
            label="Nerve"
            value={player.nerve}
            max={player.maxNerve}
            icon={BrainIcon}
            color="bg-blue-500"
          />
          <StatBar
            label="Happy"
            value={player.happy}
            max={player.maxHappy}
            icon={SmileIcon}
            color="bg-yellow-500"
          />
        </CardContent>
      </Card>

      {/* Battle Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Battle Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <BattleStat
              label="Strength"
              value={player.strength}
              icon={SwordIcon}
            />
            <BattleStat
              label="Defense"
              value={player.defense}
              icon={ShieldIcon}
            />
            <BattleStat
              label="Speed"
              value={player.speed}
              icon={ZapIcon}
            />
            <BattleStat
              label="Dexterity"
              value={player.dexterity}
              icon={TargetIcon}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Crimes', icon: '🔪', desc: 'Earn money & XP' },
              { label: 'Gym', icon: '💪', desc: 'Train your stats' },
              { label: 'Jobs', icon: '💼', desc: 'Steady income' },
              { label: 'Travel', icon: '✈️', desc: 'Explore cities' },
              { label: 'Inventory', icon: '🎒', desc: 'Your items' },
              { label: 'Shop', icon: '🏪', desc: 'Buy equipment' },
            ].map((action) => (
              <button
                key={action.label}
                disabled
                className="flex flex-col items-center gap-1 rounded-lg border border-dashed p-4 text-center opacity-50"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  Coming Soon
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
