'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useItem, sellItem } from '@/app/actions/inventory'
import { ITEMS, type ItemCategory } from '@/lib/game/constants'
import {
  BackpackIcon,
  PackageIcon,
  SparklesIcon,
  HammerIcon,
} from 'lucide-react'

type PlayerItem = {
  id: number
  itemId: string
  quantity: number
}

type Player = {
  money: number | bigint
}

const CATEGORY_ICON: Record<ItemCategory, React.ElementType> = {
  consumable: SparklesIcon,
  booster: PackageIcon,
  material: HammerIcon,
}

export default function InventoryContent({
  player,
  items,
}: {
  player: Player
  items: PlayerItem[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)

  function handleUse(itemId: string) {
    startTransition(async () => {
      const res = await useItem(itemId)
      if (res.error) setMessage({ text: res.error, type: 'error' })
      else setMessage({ text: `Used ${res.used}!`, type: 'success' })
      router.refresh()
    })
  }

  function handleSell(itemId: string) {
    startTransition(async () => {
      const res = await sellItem(itemId, 1)
      if (res.error) setMessage({ text: res.error, type: 'error' })
      else
        setMessage({
          text: `Sold for $${res.moneyEarned}`,
          type: 'success',
        })
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Balance */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <span className="text-sm font-medium">Balance</span>
          <span className="text-xl font-bold text-primary">
            ${Number(player.money).toLocaleString()}
          </span>
        </CardContent>
      </Card>

      {/* Result message */}
      {message && (
        <Card
          className={
            message.type === 'error'
              ? 'border-destructive bg-destructive/10'
              : 'border-green-500 bg-green-500/10'
          }
        >
          <CardContent className="p-3 text-sm">
            <span
              className={
                message.type === 'error'
                  ? 'text-destructive'
                  : 'text-green-600 dark:text-green-400'
              }
            >
              {message.text}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Inventory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BackpackIcon className="size-4" />
            Your Items ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Your inventory is empty. Scavenge or visit a shop to find items!
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const def = ITEMS[item.itemId]
                if (!def) return null
                const CatIcon = CATEGORY_ICON[def.category]
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <CatIcon className="size-4 text-muted-foreground" />
                        <p className="font-medium">{def.label}</p>
                        <Badge variant="secondary" className="text-xs">
                          x{item.quantity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {def.description}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {def.effect && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleUse(item.itemId)}
                        >
                          Use
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleSell(item.itemId)}
                      >
                        Sell ${Math.floor(def.value * 0.5)}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
