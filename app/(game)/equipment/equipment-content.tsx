'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SwordIcon, ShieldIcon, GemIcon, XIcon, WrenchIcon } from 'lucide-react'
import { equipItem, unequipItem } from '@/app/actions/equipment'
import { ITEMS, type EquipmentSlot, RARITY_COLORS, RARITY_BG } from '@/lib/game/constants'
import { CombatBonuses } from '@/components/game/combat-bonuses'
import { ToolEffects } from '@/components/game/tool-effects'

type PlayerItem = { id: number; itemId: string; quantity: number }

const SLOT_INFO: Record<EquipmentSlot, { label: string; icon: React.ElementType; color: string }> = {
    weapon: { label: 'Senjata', icon: SwordIcon, color: 'text-red-500' },
    armor: { label: 'Armor', icon: ShieldIcon, color: 'text-blue-500' },
    accessory: { label: 'Aksesoris', icon: GemIcon, color: 'text-purple-500' },
    tool: { label: 'Alat', icon: WrenchIcon, color: 'text-orange-500' },
}

export default function EquipmentContent({ player, playerItems }: { player: any; playerItems: PlayerItem[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleEquip = (itemId: string) => {
        startTransition(async () => { await equipItem(itemId); router.refresh() })
    }
    const handleUnequip = (slot: EquipmentSlot) => {
        startTransition(async () => { await unequipItem(slot); router.refresh() })
    }

    const equipped: Record<EquipmentSlot, string | null> = {
        weapon: player.equippedWeapon,
        armor: player.equippedArmor,
        accessory: player.equippedAccessory,
        tool: player.equippedTool,
    }

    const equipmentItems = playerItems.filter(pi => {
        const def = ITEMS[pi.itemId]
        return def && ['weapon', 'armor', 'accessory', 'tool'].includes(def.category)
    })

    return (
        <div className="space-y-6">
            {/* Equipped Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['weapon', 'armor', 'accessory', 'tool'] as EquipmentSlot[]).map(slot => {
                    const info = SLOT_INFO[slot]
                    const Icon = info.icon
                    const equippedId = equipped[slot]
                    const def = equippedId ? ITEMS[equippedId] : null

                    return (
                        <Card key={slot} className="relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${def ? 'from-primary/5' : 'from-muted/10'} to-transparent`} />
                            <CardContent className="p-4 relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`rounded-full ${def ? 'bg-primary/10' : 'bg-muted/30'} p-1.5`}>
                                        <Icon className={`size-4 ${def ? info.color : 'text-muted-foreground'}`} />
                                    </div>
                                    <span className="text-sm font-semibold">{info.label}</span>
                                </div>
                                {def ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{def.label}</p>
                                                <Badge variant="outline" className={`text-[10px] ${RARITY_COLORS[def.rarity]}`}>{def.rarity}</Badge>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => handleUnequip(slot)} disabled={isPending}>
                                                <XIcon className="size-3" />
                                            </Button>
                                        </div>
                                        {def.combatBonus && <CombatBonuses bonus={def.combatBonus} />}
                                        {def.toolEffect && <div className="mt-1"><ToolEffects effect={def.toolEffect} /></div>}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Kosong</p>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Available Equipment */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Equipment yang Dimiliki</CardTitle>
                    <CardDescription className="text-xs">Equip item dari inventory untuk meningkatkan stat pertarungan.</CardDescription>
                </CardHeader>
                <CardContent>
                    {equipmentItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Belum punya equipment. Craft atau beli dari toko!</p>
                    ) : (
                        <div className="space-y-2">
                            {equipmentItems.map(pi => {
                                const def = ITEMS[pi.itemId]
                                if (!def) return null
                                const slot = def.equipSlot!
                                const isEquipped = equipped[slot] === pi.itemId

                                return (
                                    <div key={pi.id} className={`flex items-center justify-between rounded-lg border p-3 ${isEquipped ? 'border-primary/50 bg-primary/5' : ''}`}>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                {(() => { const Icon = SLOT_INFO[slot].icon; return <Icon className={`size-4 ${SLOT_INFO[slot].color}`} /> })()}
                                                <span className="text-sm font-medium">{def.label}</span>
                                                <Badge variant="outline" className={`text-[10px] ${RARITY_COLORS[def.rarity]}`}>{def.rarity}</Badge>
                                                {isEquipped && <Badge className="text-[10px] bg-primary">Aktif</Badge>}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{def.description}</p>
                                            {def.combatBonus && <CombatBonuses bonus={def.combatBonus} />}
                                            {def.toolEffect && <ToolEffects effect={def.toolEffect} />}
                                        </div>
                                        <Button size="sm" variant={isEquipped ? 'outline' : 'default'}
                                            onClick={() => isEquipped ? handleUnequip(slot) : handleEquip(pi.itemId)}
                                            disabled={isPending}>
                                            {isEquipped ? 'Lepas' : 'Pasang'}
                                        </Button>
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
