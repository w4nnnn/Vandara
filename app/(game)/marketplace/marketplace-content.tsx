'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ShoppingBagIcon, CoinsIcon, PlusIcon, TagIcon, XIcon,
  PackageIcon, SearchIcon,
} from 'lucide-react'
import { ITEMS, MARKET_LISTING_FEE_PERCENT } from '@/lib/game/constants'
import { RarityBadge } from '@/components/game/rarity-badge'
import {
  getMarketListings, getMyListings, createListing, buyListing, cancelListing,
} from '@/app/actions/marketplace'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'

type Player = {
  id: number
  money: number
}

type Listing = {
  id: number
  sellerId: number
  itemId: string
  quantity: number
  price: number
  sellerName?: string
}

type InventoryItem = {
  itemId: string
  quantity: number
}

export default function MarketplaceContent({ player, inventory }: { player: Player; inventory: InventoryItem[] }) {
  const router = useRouter()
  const { t } = useTranslation()
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'browse' | 'sell' | 'my'>('browse')
  const [listings, setListings] = useState<Listing[]>([])
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [loaded, setLoaded] = useState(false)

  // Sell form
  const [sellItemId, setSellItemId] = useState('')
  const [sellQty, setSellQty] = useState('1')
  const [sellPrice, setSellPrice] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [all, mine] = await Promise.all([getMarketListings(), getMyListings()])
    setListings(all)
    setMyListings(mine)
    setLoaded(true)
  }

  const handleBuy = (listingId: number) => {
    startTransition(async () => {
      const res = await buyListing(listingId)
      if (res.error) { toast.error(res.error); return }
      const item = ITEMS[res.itemId!]
      toast.success(`Membeli ${item?.label ?? res.itemId} x${res.quantity}!`)
      await loadData()
      router.refresh()
    })
  }

  const handleSell = () => {
    const qty = parseInt(sellQty)
    const price = parseInt(sellPrice)
    if (!sellItemId || !qty || !price) return
    startTransition(async () => {
      const res = await createListing(sellItemId, qty, price)
      if (res.error) { toast.error(res.error); return }
      toast.success(`Listing dibuat! Biaya: $${res.fee}`)
      setSellItemId('')
      setSellQty('1')
      setSellPrice('')
      await loadData()
      router.refresh()
    })
  }

  const handleCancel = (listingId: number) => {
    startTransition(async () => {
      const res = await cancelListing(listingId)
      if (res.error) { toast.error(res.error); return }
      toast.success('Listing dibatalkan, item dikembalikan.')
      await loadData()
      router.refresh()
    })
  }

  const filteredListings = searchQuery
    ? listings.filter(l => {
      const def = ITEMS[l.itemId]
      return def?.label.toLowerCase().includes(searchQuery.toLowerCase())
    })
    : listings

  if (!loaded) return <div className="text-center text-muted-foreground py-8">Memuat...</div>

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === 'browse' ? 'default' : 'outline'} size="sm" onClick={() => setTab('browse')}>
          <ShoppingBagIcon className="mr-1 size-4" /> {t('market.browse')}
        </Button>
        <Button variant={tab === 'sell' ? 'default' : 'outline'} size="sm" onClick={() => setTab('sell')}>
          <PlusIcon className="mr-1 size-4" /> {t('market.sell')}
        </Button>
        <Button variant={tab === 'my' ? 'default' : 'outline'} size="sm" onClick={() => setTab('my')}>
          <PackageIcon className="mr-1 size-4" /> {t('market.myListings')}
        </Button>
      </div>

      {/* Browse */}
      {tab === 'browse' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBagIcon className="size-5" />
              {t('market.title')}
            </CardTitle>
            <CardDescription>{t('market.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t('market.search')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {filteredListings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t('market.empty')}</p>
            ) : (
              <div className="space-y-2">
                {filteredListings.map(l => {
                  const def = ITEMS[l.itemId]
                  return (
                    <div key={l.id} className="flex items-center justify-between rounded border p-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{def?.label ?? l.itemId}</span>
                          {def && <RarityBadge rarity={def.rarity} />}
                          {l.quantity > 1 && <Badge variant="secondary" className="text-[10px]">x{l.quantity}</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('market.seller')}: {l.sellerName}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-yellow-400">${l.price.toLocaleString()}</span>
                        <Button
                          size="sm"
                          onClick={() => handleBuy(l.id)}
                          disabled={isPending || player.money < l.price || l.sellerId === player.id}
                        >
                          {t('market.buyBtn')}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sell */}
      {tab === 'sell' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('market.createListing')}</CardTitle>
            <CardDescription>{t('market.feeInfo', { fee: String(MARKET_LISTING_FEE_PERCENT) })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('market.selectItem')}</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {inventory.filter(i => ITEMS[i.itemId]).map(item => {
                  const def = ITEMS[item.itemId]!
                  const isSelected = sellItemId === item.itemId
                  return (
                    <button
                      key={item.itemId}
                      onClick={() => setSellItemId(item.itemId)}
                      className={`text-left rounded border p-2 text-xs transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}
                    >
                      <div className="font-medium">{def.label}</div>
                      <div className="text-muted-foreground">x{item.quantity}</div>
                    </button>
                  )
                })}
              </div>
            </div>
            {sellItemId && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium">{t('market.quantity')}</label>
                    <Input type="number" value={sellQty} onChange={e => setSellQty(e.target.value)} min={1} />
                  </div>
                  <div>
                    <label className="text-xs font-medium">{t('market.price')}</label>
                    <Input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} min={10} />
                  </div>
                </div>
                {sellPrice && (
                  <p className="text-xs text-muted-foreground">
                    <TagIcon className="inline size-3 mr-1" />
                    {t('market.feeAmount')}: ${Math.ceil(parseInt(sellPrice) * MARKET_LISTING_FEE_PERCENT / 100).toLocaleString()}
                  </p>
                )}
                <Button onClick={handleSell} disabled={isPending} className="w-full">
                  <PlusIcon className="mr-2 size-4" /> {t('market.listItem')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Listings */}
      {tab === 'my' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('market.myListings')}</CardTitle>
          </CardHeader>
          <CardContent>
            {myListings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t('market.noListings')}</p>
            ) : (
              <div className="space-y-2">
                {myListings.map(l => {
                  const def = ITEMS[l.itemId]
                  return (
                    <div key={l.id} className="flex items-center justify-between rounded border p-3">
                      <div>
                        <span className="font-medium text-sm">{def?.label ?? l.itemId}</span>
                        {l.quantity > 1 && <span className="text-xs text-muted-foreground ml-1">x{l.quantity}</span>}
                        <div className="text-xs text-yellow-400">${l.price.toLocaleString()}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(l.id)} disabled={isPending}>
                        <XIcon className="size-4 text-destructive" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
