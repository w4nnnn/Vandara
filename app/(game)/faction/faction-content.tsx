'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  ShieldIcon, UsersIcon, CrownIcon, CoinsIcon, LogOutIcon,
  PlusCircleIcon, DoorOpenIcon, TrendingUpIcon,
} from 'lucide-react'
import {
  getFaction, createFaction, leaveFaction, listFactions, joinFaction, depositFactionMoney,
} from '@/app/actions/factions'
import { FACTION_CREATE_COST, FACTION_MAX_MEMBERS, FACTION_TERRITORY_BONUSES, type LocationId } from '@/lib/game/constants'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'

type Player = {
  id: number
  level: number
  money: number
  factionId: number | null
}

type FactionInfo = {
  id: number
  name: string
  tag: string
  leaderId: number
  description: string | null
  money: number
  territoryId: string | null
}

type FactionMember = {
  id: number
  name: string
  level: number
  strength: number
  constitution: number
}

export default function FactionContent({ player }: { player: Player }) {
  const router = useRouter()
  const { t } = useTranslation()
  const [isPending, startTransition] = useTransition()
  const [faction, setFaction] = useState<FactionInfo | null>(null)
  const [members, setMembers] = useState<FactionMember[]>([])
  const [allFactions, setAllFactions] = useState<(FactionInfo & { memberCount: number })[]>([])
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState<'my' | 'browse' | 'create'>('my')

  // Create form
  const [newName, setNewName] = useState('')
  const [newTag, setNewTag] = useState('')
  const [depositAmt, setDepositAmt] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [factionRes, factionsRes] = await Promise.all([getFaction(), listFactions()])
    if ('faction' in factionRes && factionRes.faction) {
      setFaction(factionRes.faction)
      setMembers(factionRes.members)
      setTab('my')
    } else {
      setTab('browse')
    }
    setAllFactions(factionsRes)
    setLoaded(true)
  }

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createFaction(newName.trim(), newTag.trim())
      if (res.error) { toast.error(res.error); return }
      toast.success('Faksi berhasil dibuat!')
      setNewName('')
      setNewTag('')
      await loadData()
      router.refresh()
    })
  }

  const handleLeave = () => {
    startTransition(async () => {
      const res = await leaveFaction()
      if (res.error) { toast.error(res.error); return }
      toast.success('Kamu keluar dari faksi.')
      setFaction(null)
      setMembers([])
      await loadData()
      router.refresh()
    })
  }

  const handleJoin = (fId: number) => {
    startTransition(async () => {
      const res = await joinFaction(fId)
      if (res.error) { toast.error(res.error); return }
      toast.success('Berhasil bergabung!')
      await loadData()
      router.refresh()
    })
  }

  const handleDeposit = () => {
    const amt = parseInt(depositAmt)
    if (!amt || amt <= 0) return
    startTransition(async () => {
      const res = await depositFactionMoney(amt)
      if (res.error) { toast.error(res.error); return }
      toast.success(`Berhasil setor $${amt.toLocaleString()}`)
      setDepositAmt('')
      await loadData()
      router.refresh()
    })
  }

  if (!loaded) return <div className="text-center text-muted-foreground py-8">Memuat...</div>

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {faction && (
          <Button variant={tab === 'my' ? 'default' : 'outline'} size="sm" onClick={() => setTab('my')}>
            <ShieldIcon className="mr-1 size-4" /> {t('faction.myFaction')}
          </Button>
        )}
        <Button variant={tab === 'browse' ? 'default' : 'outline'} size="sm" onClick={() => setTab('browse')}>
          <UsersIcon className="mr-1 size-4" /> {t('faction.browse')}
        </Button>
        {!faction && (
          <Button variant={tab === 'create' ? 'default' : 'outline'} size="sm" onClick={() => setTab('create')}>
            <PlusCircleIcon className="mr-1 size-4" /> {t('faction.create')}
          </Button>
        )}
      </div>

      {/* My Faction */}
      {tab === 'my' && faction && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldIcon className="size-5 text-purple-400" />
                [{faction.tag}] {faction.name}
              </CardTitle>
              {faction.description && <CardDescription>{faction.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CoinsIcon className="size-4 text-yellow-400" />
                  <span>${faction.money.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-4" />
                  <span>{members.length}/{FACTION_MAX_MEMBERS}</span>
                </div>
              </div>

              {faction.territoryId && FACTION_TERRITORY_BONUSES[faction.territoryId as LocationId] && (
                <Alert className="border-purple-500/30 bg-purple-500/5">
                  <TrendingUpIcon className="size-4 text-purple-400" />
                  <AlertTitle className="text-sm">{t('faction.territory')}: {FACTION_TERRITORY_BONUSES[faction.territoryId as LocationId].label}</AlertTitle>
                  <AlertDescription className="text-xs">{FACTION_TERRITORY_BONUSES[faction.territoryId as LocationId].bonus}</AlertDescription>
                </Alert>
              )}

              {/* Deposit */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={t('faction.depositAmount')}
                  value={depositAmt}
                  onChange={e => setDepositAmt(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleDeposit} disabled={isPending} size="sm">
                  <CoinsIcon className="mr-1 size-4" /> {t('faction.deposit')}
                </Button>
              </div>

              {/* Members */}
              <div>
                <h3 className="text-sm font-medium mb-2">{t('faction.members')}</h3>
                <div className="space-y-1.5">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        {m.id === faction.leaderId && <CrownIcon className="size-3.5 text-yellow-400" />}
                        <span>{m.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Lv.{m.level}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="destructive" size="sm" onClick={handleLeave} disabled={isPending}>
                <LogOutIcon className="mr-1 size-4" /> {t('faction.leave')}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Browse Factions */}
      {tab === 'browse' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('faction.available')}</CardTitle>
          </CardHeader>
          <CardContent>
            {allFactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('faction.none')}</p>
            ) : (
              <div className="space-y-2">
                {allFactions.map(f => (
                  <div key={f.id} className="flex items-center justify-between rounded border px-3 py-3">
                    <div>
                      <span className="font-medium text-sm">[{f.tag}] {f.name}</span>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{f.memberCount}/{FACTION_MAX_MEMBERS} anggota</span>
                        {f.territoryId && <span>Wilayah: {FACTION_TERRITORY_BONUSES[f.territoryId as LocationId]?.label ?? f.territoryId}</span>}
                      </div>
                    </div>
                    {!faction && f.memberCount < FACTION_MAX_MEMBERS && (
                      <Button size="sm" variant="outline" onClick={() => handleJoin(f.id)} disabled={isPending}>
                        <DoorOpenIcon className="mr-1 size-4" /> {t('faction.join')}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Faction */}
      {tab === 'create' && !faction && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('faction.createTitle')}</CardTitle>
            <CardDescription>{t('faction.createDesc', { cost: FACTION_CREATE_COST.toLocaleString() })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder={t('faction.namePlaceholder')}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              maxLength={30}
            />
            <Input
              placeholder={t('faction.tagPlaceholder')}
              value={newTag}
              onChange={e => setNewTag(e.target.value.toUpperCase())}
              maxLength={5}
            />
            <Button onClick={handleCreate} disabled={isPending || !newName.trim() || !newTag.trim()} className="w-full">
              <PlusCircleIcon className="mr-2 size-4" />
              {t('faction.createBtn')} (${FACTION_CREATE_COST.toLocaleString()})
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
