'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCartIcon, CoinsIcon, StoreIcon, SkullIcon, SparklesIcon, PackageIcon, HammerIcon } from 'lucide-react'
import { buyShopItem, SHOP_INVENTORY } from '@/app/actions/shop'
import { ITEMS, LOCATIONS, type LocationId, type ItemCategory } from '@/lib/game/constants'

type Player = {
    id: number
    name: string
    money: number | bigint
    currentLocation: string
}

const CATEGORY_ICON: Record<ItemCategory, React.ElementType> = {
    consumable: SparklesIcon,
    booster: PackageIcon,
    material: HammerIcon,
}

export default function ShopContent({ player }: { player: Player }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const availableItemIds = SHOP_INVENTORY[player.currentLocation] || []
    const isBlackMarket = player.currentLocation === 'dark_alley'
    const priceMultiplier = isBlackMarket ? 1.5 : 1.0

    function handleBuy(itemId: string) {
        startTransition(async () => {
            const res = await buyShopItem(itemId, 1)
            if (res.error) setMessage({ text: res.error, type: 'error' })
            else setMessage({ text: `Bought ${res.bought} for $${res.totalCost}`, type: 'success' })
            router.refresh()
        })
    }

    if (availableItemIds.length === 0) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <StoreIcon className="size-5 text-muted-foreground" />
                            No Shop Here
                        </CardTitle>
                        <CardDescription>
                            There are no vendors operating in this location. Head to the City Center or Dark Alley.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {isBlackMarket ? <SkullIcon className="size-5 text-red-500" /> : <StoreIcon className="size-5 text-primary" />}
                                {isBlackMarket ? 'Black Market' : 'General Store'}
                            </CardTitle>
                            <CardDescription>
                                {isBlackMarket
                                    ? "Shady goods at steep prices. No questions asked."
                                    : "Basic necessities and recovery items for the everyday citizen."}
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-muted-foreground">Your Balance</div>
                            <div className="flex items-center justify-end gap-1 text-lg font-bold text-emerald-400">
                                <CoinsIcon className="size-4" />
                                {Number(player.money).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {message && (
                        <div className={`p-3 text-sm rounded-lg ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid gap-3">
                        {availableItemIds.map((itemId) => {
                            const def = ITEMS[itemId]
                            if (!def) return null

                            const CatIcon = CATEGORY_ICON[def.category]
                            const cost = Math.floor(def.value * priceMultiplier)
                            const canAfford = Number(player.money) >= cost

                            return (
                                <div key={def.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CatIcon className="size-4 text-muted-foreground shrink-0" />
                                            <p className="font-semibold">{def.label}</p>
                                            <Badge variant="secondary" className="text-[10px] uppercase">
                                                {def.category}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {def.description}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="shrink-0 w-full sm:w-auto"
                                        disabled={isPending || !canAfford}
                                        onClick={() => handleBuy(def.id)}
                                        variant={isBlackMarket ? 'destructive' : 'default'}
                                    >
                                        <ShoppingCartIcon className="mr-2 size-4" />
                                        Buy ${cost.toLocaleString()}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
