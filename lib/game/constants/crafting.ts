export interface CraftingRecipe {
  id: string
  label: string
  inputs: { itemId: string; quantity: number }[]
  output: { itemId: string; quantity: number }
  levelRequired: number       // player level
  scavengeLevelRequired: number
  category: 'weapon' | 'armor' | 'consumable' | 'tool'
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  // Weapons
  {
    id: 'craft_pipe_wrench', label: 'Kunci Pipa', category: 'weapon',
    inputs: [{ itemId: 'scrap_metal', quantity: 5 }, { itemId: 'rusty_screw', quantity: 3 }],
    output: { itemId: 'pipe_wrench', quantity: 1 }, levelRequired: 3, scavengeLevelRequired: 2
  },
  {
    id: 'craft_combat_knife', label: 'Pisau Tempur', category: 'weapon',
    inputs: [{ itemId: 'scrap_metal', quantity: 8 }, { itemId: 'rusty_shiv', quantity: 2 }, { itemId: 'torn_fabric', quantity: 3 }],
    output: { itemId: 'combat_knife', quantity: 1 }, levelRequired: 6, scavengeLevelRequired: 4
  },
  {
    id: 'craft_taser', label: 'Taser', category: 'weapon',
    inputs: [{ itemId: 'old_battery', quantity: 8 }, { itemId: 'scrap_metal', quantity: 5 }, { itemId: 'broken_plastic', quantity: 4 }],
    output: { itemId: 'taser', quantity: 1 }, levelRequired: 10, scavengeLevelRequired: 6
  },
  // Armor
  {
    id: 'craft_leather_jacket', label: 'Jaket Kulit', category: 'armor',
    inputs: [{ itemId: 'torn_fabric', quantity: 8 }, { itemId: 'rusty_screw', quantity: 4 }],
    output: { itemId: 'leather_jacket', quantity: 1 }, levelRequired: 4, scavengeLevelRequired: 3
  },
  {
    id: 'craft_kevlar_vest', label: 'Rompi Kevlar', category: 'armor',
    inputs: [{ itemId: 'scrap_metal', quantity: 12 }, { itemId: 'torn_fabric', quantity: 10 }, { itemId: 'broken_plastic', quantity: 6 }],
    output: { itemId: 'kevlar_vest', quantity: 1 }, levelRequired: 12, scavengeLevelRequired: 7
  },
  // Consumables
  {
    id: 'craft_adv_medkit', label: 'Medkit Lanjut', category: 'consumable',
    inputs: [{ itemId: 'medkit', quantity: 1 }, { itemId: 'bandages', quantity: 3 }, { itemId: 'old_battery', quantity: 2 }],
    output: { itemId: 'advanced_medkit', quantity: 1 }, levelRequired: 8, scavengeLevelRequired: 5
  },
  {
    id: 'craft_super_energy', label: 'Super Energy', category: 'consumable',
    inputs: [{ itemId: 'energy_drink', quantity: 2 }, { itemId: 'protein_shake', quantity: 1 }],
    output: { itemId: 'super_energy', quantity: 1 }, levelRequired: 5, scavengeLevelRequired: 3
  },
]
