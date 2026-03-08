'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useItem, sellItem } from '@/app/actions/inventory'
import { ITEMS, type ItemCategory, RARITY_COLORS, RARITY_BG, type ItemRarity } from '@/lib/game/constants'
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
  CoinsIcon,
  TrashIcon,
  ZapIcon,
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
  junk: TrashIcon,
  tool: WrenchIcon,
  weapon: SwordIcon,
  armor: ShieldIcon,
  accessory: GemIcon,
}

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  consumable: 'consumable',
  booster: 'booster',
  material: 'material',
  junk: 'junk',
  tool: 'tool',
  weapon: 'weapon',
  armor: 'armor',
  accessory: 'accessory',
}

const RARITY_LABELS: Record<ItemRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items
    return items.filter((item) => {
      const def = ITEMS[item.itemId]
      return def && def.category === selectedCategory
    })
  }, [items, selectedCategory])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length }
    items.forEach((item) => {
      const def = ITEMS[item.itemId]
      if (def) {
        counts[def.category] = (counts[def.category] || 0) + 1
      }
    })
    return counts
  }, [items])

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CoinsIcon className="size-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{t('balance')}</span>
          </div>
          <span className="text-2xl font-bold text-primary">
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

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            <BackpackIcon className="size-3 sm:size-4 mr-1 sm:mr-2" />
            Semua ({categoryCounts.all || 0})
          </TabsTrigger>
          <TabsTrigger value="consumable" className="text-xs sm:text-sm">
            <SparklesIcon className="size-3 sm:size-4 mr-1 sm:mr-2" />
            Konsumsi ({categoryCounts.consumable || 0})
          </TabsTrigger>
          <TabsTrigger value="material" className="text-xs sm:text-sm">
            <HammerIcon className="size-3 sm:size-4 mr-1 sm:mr-2" />
            Material ({categoryCounts.material || 0})
          </TabsTrigger>
          <TabsTrigger value="tool" className="text-xs sm:text-sm">
            <WrenchIcon className="size-3 sm:size-4 mr-1 sm:mr-2" />
            Alat ({categoryCounts.tool || 0})
          </TabsTrigger>
          <TabsTrigger value="weapon" className="text-xs sm:text-sm">
            <SwordIcon className="size-3 sm:size-4 mr-1 sm:mr-2" />
            Senjata ({categoryCounts.weapon || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BackpackIcon className="size-4" />
                {t('inventory.yourItems')} ({filteredItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BackpackIcon className="size-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory === 'all'
                      ? t('inventory.empty')
                      : `Tidak ada item di kategori ${CATEGORY_LABELS[selectedCategory as ItemCategory]}`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredItems.map((item) => {
                    const def = ITEMS[item.itemId]
                    if (!def) return null
                    const CatIcon = CATEGORY_ICON[def.category]
                    const rarityColor = RARITY_COLORS[def.rarity]
                    const rarityBg = RARITY_BG[def.rarity]

                    return (
                      <div
                        key={item.id}
                        className={`group relative rounded-lg border p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${rarityBg} ${rarityColor.split(' ')[1]}`}
                      >
                        <div className="flex flex-col h-full justify-between gap-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg bg-muted/50 ${rarityColor}`}>
                                <CatIcon className="size-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm leading-tight">
                                  {t(`item.${def.id}`)}
                                </p>
                                <Badge variant="outline" className="text-[10px] h-4 mt-1">
                                  {RARITY_LABELS[def.rarity]}
                                </Badge>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-xs font-bold bg-primary/10 text-primary"
                            >
                              x{item.quantity}
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {t(`item.${def.id}.desc`)}
                          </p>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t border-muted">
                            {def.effect && (
                              <Button
                                size="sm"
                                disabled={isPending}
                                onClick={() => handleUse(item.itemId)}
                                className="flex-1 text-xs h-8 transition-all duration-200 hover:shadow-md"
                              >
                                <ZapIcon className="size-3 mr-1" />
                                {t('inventory.use')}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isPending}
                              onClick={() => handleSell(item.itemId)}
                              className={`${def.effect ? 'flex-1' : 'w-full'} text-xs h-8 transition-all duration-200 hover:shadow-md`}
                            >
                              <CoinsIcon className="size-3 mr-1" />
                              Jual ${Math.floor(def.value * 0.5)}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
