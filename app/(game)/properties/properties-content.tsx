'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BuildingIcon, CoinsIcon, HomeIcon, BriefcaseIcon, SkullIcon, ClockIcon, LandmarkIcon } from 'lucide-react'
import { buyProperty, collectIncome } from '@/app/actions/properties'
import { PROPERTIES, type LocationId } from '@/lib/game/constants'

type Player = {
    id: number
    money: number
    currentLocation: string
}

type OwnedProperty = {
    id: number
    propertyId: string
    lastCollectedAt: string
}

const PROP_ICONS: Record<string, React.ElementType> = {
    apartment_complex: HomeIcon,
    office_building: BriefcaseIcon,
    nightclub: SkullIcon,
}

export default function PropertiesContent({ player, ownedProperties }: { player: Player, ownedProperties: OwnedProperty[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(interval)
    }, [])

    function handleBuy(propId: string) {
        startTransition(async () => {
            const res = await buyProperty(propId)
            if (res.error) setMessage({ text: res.error, type: 'error' })
            else setMessage({ text: `Successfully purchased ${res.bought}!`, type: 'success' })
            router.refresh()
        })
    }

    function handleCollect(playerPropId: number) {
        startTransition(async () => {
            const res = await collectIncome(playerPropId)
            if (res.error) setMessage({ text: res.error, type: 'error' })
            else setMessage({ text: `Collected $${res.income} from ${res.label}!`, type: 'success' })
            router.refresh()
        })
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LandmarkIcon className="size-6 text-primary" />
                        Real Estate Market
                    </h1>
                    <p className="text-sm text-muted-foreground">Invest in businesses to earn passive income over time.</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-right">
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Your Balance</div>
                    <div className="flex items-center justify-end gap-1.5 text-xl font-black text-emerald-600 dark:text-emerald-400">
                        <CoinsIcon className="size-5" />
                        ${player.money.toLocaleString()}
                    </div>
                </div>
            </header>

            {message && (
                <div className={`p-4 text-sm rounded-xl border ${message.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-6">
                {/* Available for Purchase */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold px-1">Available Properties</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {Object.values(PROPERTIES).map((prop) => {
                            const isOwned = ownedProperties.some(p => p.propertyId === prop.id)
                            const Icon = PROP_ICONS[prop.id] || BuildingIcon
                            const isWrongLocation = player.currentLocation !== prop.locationId
                            const canAfford = player.money >= prop.cost

                            return (
                                <Card key={prop.id} className={`${isOwned ? 'opacity-60 grayscale' : ''}`}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <Icon className="size-4 text-primary" />
                                                    {prop.label}
                                                </CardTitle>
                                                <CardDescription>{prop.description}</CardDescription>
                                            </div>
                                            {isOwned && <Badge variant="secondary">Owned</Badge>}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Income</span>
                                            <span className="font-bold text-emerald-500">+${prop.incomePerHour}/hour</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Location</span>
                                            <span className="capitalize">{prop.locationId.replace('_', ' ')}</span>
                                        </div>
                                    </CardContent>
                                    {!isOwned && (
                                        <CardFooter>
                                            <Button
                                                className="w-full"
                                                variant={canAfford && !isWrongLocation ? 'default' : 'secondary'}
                                                disabled={isPending || isOwned || !canAfford || isWrongLocation}
                                                onClick={() => handleBuy(prop.id)}
                                            >
                                                {isWrongLocation ? `Travel to ${prop.locationId}` : `Buy for $${prop.cost.toLocaleString()}`}
                                            </Button>
                                        </CardFooter>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                </section>

                {/* Dashboard of Earnings */}
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold px-1">Income Dashboard</h2>
                    {ownedProperties.length === 0 ? (
                        <div className="text-center py-12 border rounded-xl bg-muted/20">
                            <LandmarkIcon className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">You don't own any properties yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {ownedProperties.map((owned) => {
                                const propDef = PROPERTIES[owned.propertyId]
                                if (!propDef) return null
                                const Icon = PROP_ICONS[owned.propertyId] || BuildingIcon

                                const elapsedHours = (now - new Date(owned.lastCollectedAt).getTime()) / (1000 * 60 * 60)
                                const pendingIncome = Math.floor(elapsedHours * propDef.incomePerHour)
                                const canCollect = pendingIncome > 0

                                return (
                                    <Card key={owned.id} className="overflow-hidden border-primary/20">
                                        <div className="flex flex-col sm:flex-row">
                                            <div className="p-4 flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                                        <Icon className="size-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold">{propDef.label}</h3>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <ClockIcon className="size-3" />
                                                            Last claimed: {new Date(owned.lastCollectedAt).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-muted/50 p-2 rounded-lg text-center">
                                                        <div className="text-[10px] text-muted-foreground uppercase">Rate</div>
                                                        <div className="text-sm font-bold">${propDef.incomePerHour}/hr</div>
                                                    </div>
                                                    <div className="bg-emerald-500/10 p-2 rounded-lg text-center">
                                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">Pending</div>
                                                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${pendingIncome}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-muted/30 border-t sm:border-t-0 sm:border-l p-4 flex items-center justify-center">
                                                <Button
                                                    onClick={() => handleCollect(owned.id)}
                                                    disabled={isPending || !canCollect}
                                                    className="w-full sm:w-auto min-w-[120px]"
                                                >
                                                    Claim Money
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
