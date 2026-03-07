'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { SearchIcon, MapPinIcon, ZapIcon, InfoIcon, ArchiveIcon } from 'lucide-react'
import { scavenge } from '@/app/actions/scavenge'
import { LOCATIONS, type LocationId } from '@/lib/game/constants'

// Copy of Player type for props
type Player = {
    id: number
    name: string
    money: number | bigint
    energy: number
    maxEnergy: number
    currentLocation: string
}

export default function ScavengeContent({ player }: { player: Player }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<{
        success?: boolean
        loot?: { label: string; money?: number; itemId?: string; quantity?: number }
        error?: string
    } | null>(null)

    const handleScavenge = () => {
        setResult(null)
        startTransition(async () => {
            const res = await scavenge()
            setResult(res)
            router.refresh()
        })
    }

    const currentLoc = LOCATIONS[player.currentLocation as LocationId]

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPinIcon className="size-5 text-primary" />
                        Scavenging in {currentLoc?.label || 'Unknown Area'}
                    </CardTitle>
                    <CardDescription>
                        Spend energy to search the current area for loose cash, dropped items, or discarded materials.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                        <div className="flex items-start gap-3">
                            <InfoIcon className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="text-sm">
                                <p className="font-semibold text-foreground mb-1">Area Details:</p>
                                <p className="text-muted-foreground">
                                    Different areas yield different types of loot. Urban centers might have dropped money or luxury items, while back alleys might yield weapons or scrap.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Result Card */}
                    {result && (
                        <Alert variant={result.error ? 'destructive' : 'default'} className={result.success ? "border-green-500/50 bg-green-500/10" : ""}>
                            <AlertTitle className="flex items-center gap-2">
                                {result.error ? <InfoIcon className="size-4" /> : <ArchiveIcon className="size-4 text-green-500" />}
                                {result.error ? 'Scavenge Failed' : 'Loot Found!'}
                            </AlertTitle>
                            <AlertDescription>
                                {result.error && result.error}
                                {result.success && result.loot && (
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        You found {result.loot.quantity && result.loot.quantity > 1 ? `${result.loot.quantity}x ` : ''}
                                        {result.loot.money ? `$${result.loot.money} (${result.loot.label})` : result.loot.label}!
                                    </span>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border p-4">
                        <div>
                            <p className="font-semibold">Search Area</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    <ZapIcon className="size-3 text-orange-400 mr-1" />
                                    Cost: 5 Energy
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    (You have {player.energy} Energy)
                                </span>
                            </div>
                        </div>
                        <Button
                            onClick={handleScavenge}
                            disabled={isPending || player.energy < 5}
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            <SearchIcon className="mr-2 size-4" />
                            {isPending ? 'Searching...' : 'Search Now'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
