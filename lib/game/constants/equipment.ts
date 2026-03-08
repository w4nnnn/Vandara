import { ITEMS } from './items'


export type EquipmentSlot = 'weapon' | 'armor' | 'accessory' | 'tool'

export const EQUIPMENT_SLOTS: EquipmentSlot[] = ['weapon', 'armor', 'accessory', 'tool']

export interface CombatBonus {
  attack?: number
  defense?: number
  speed?: number
  dexterity?: number
  maxHp?: number
}

export function getEquipmentBonuses(player: {
  equippedWeapon?: string | null
  equippedArmor?: string | null
  equippedAccessory?: string | null
}): CombatBonus {
  const combined: CombatBonus = {}
  const slots = [player.equippedWeapon, player.equippedArmor, player.equippedAccessory]
  for (const itemId of slots) {
    if (!itemId) continue
    const def = ITEMS[itemId]
    if (!def?.combatBonus) continue
    for (const [key, val] of Object.entries(def.combatBonus)) {
      ; (combined as any)[key] = ((combined as any)[key] ?? 0) + (val as number)
    }
  }
  return combined
}


