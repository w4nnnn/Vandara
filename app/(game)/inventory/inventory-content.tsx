'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useItem, sellItem } from '@/app/actions/inventory'
import { ITEMS, type ItemCategory } from '@/lib/game/constants'
import { useTranslation } from '@/lib/i18n'
import {
  BackpackIcon,
  PackageIcon,
  SparklesIcon,
  HammerIcon,
  WrenchIcon,
  SwordIcon,
  ShieldIcon,
  GemIcon,
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
  junk: BackpackIcon,
  tool: WrenchIcon,
  weapon: SwordIcon,
  armor: ShieldIcon,
  accessory: GemIcon,
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
  const { t } = useTranslation()
  const [message, setMessage] = useState<{
    text: string
    type: 'success' | 'error'
  } | null>(null)

  function handleUse(itemId: string) {
    startTransition(async () => {
      const res = await useItem(itemId)
      if (res.error) setMessage({ text: res.error, type: 'error' })
      else setMessage({ text: t('inventory.used', { item: t(`item.${res.used}`) }), type: 'success' })
      router.refresh()
    })
  }

  function handleSell(itemId: string) {
    startTransition(async () => {
      const res = await sellItem(itemId, 1)
      if (res.error) setMessage({ text: res.error, type: 'error' })
      else
        setMessage({
          text: t('inventory.sold', { price: String(res.moneyEarned) }),
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
          <span className="text-sm font-medium">{t('balance')}</span>
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
            {t('inventory.yourItems')} ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('inventory.empty')}
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
                        <p className="font-medium">{t(`item.${def.id}`)}</p>
                        <Badge variant="secondary" className="text-xs">
                          x{item.quantity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t(`item.${def.id}.desc`)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {def.effect && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleUse(item.itemId)}
                        >
                          {t('inventory.use')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleSell(item.itemId)}
                      >
                        {t('inventory.sell')} ${Math.floor(def.value * 0.5)}
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
