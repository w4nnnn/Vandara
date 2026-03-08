import { LocationId } from './locations'

export type QuestObjective = 'scavenge' | 'combat_win' | 'gym_train' | 'job_work' | 'travel' | 'craft' | 'shop_buy'

export interface QuestDef {
  id: string
  label: string
  description: string
  objective: QuestObjective
  target: number             // how many times
  locationId?: LocationId    // optional location requirement
  rewards: {
    money?: number
    xp?: number
    itemId?: string
    itemQty?: number
    reputation?: { locationId: LocationId; amount: number }
  }
}

export const DAILY_QUESTS: QuestDef[] = [
  {
    id: 'q_scavenge_5', label: 'Pemulung Rajin', description: 'Mulung 5 kali di lokasi manapun.', objective: 'scavenge', target: 5,
    rewards: { money: 500, xp: 50 }
  },
  {
    id: 'q_combat_3', label: 'Petarung Jalanan', description: 'Menangkan 3 pertarungan NPC.', objective: 'combat_win', target: 3,
    rewards: { money: 1000, xp: 80, reputation: { locationId: 'dark_alley', amount: 20 } }
  },
  {
    id: 'q_gym_3', label: 'Atlet Pemula', description: 'Latihan di gym 3 kali.', objective: 'gym_train', target: 3,
    rewards: { money: 300, xp: 40, itemId: 'protein_shake', itemQty: 1 }
  },
  {
    id: 'q_job_2', label: 'Pekerja Keras', description: 'Bekerja 2 kali.', objective: 'job_work', target: 2,
    rewards: { money: 800, xp: 60 }
  },
  {
    id: 'q_travel_3', label: 'Penjelajah', description: 'Travel ke 3 lokasi berbeda.', objective: 'travel', target: 3,
    rewards: { money: 300, xp: 30 }
  },
  {
    id: 'q_scavenge_da', label: 'Penjelajah Gelap', description: 'Mulung 3 kali di Dark Alley.', objective: 'scavenge', target: 3, locationId: 'dark_alley',
    rewards: { money: 700, xp: 60, reputation: { locationId: 'dark_alley', amount: 15 } }
  },
  {
    id: 'q_craft_1', label: 'Pengrajin', description: 'Craft 1 item apapun.', objective: 'craft', target: 1,
    rewards: { money: 400, xp: 50 }
  },
  {
    id: 'q_shop_2', label: 'Pembeli Setia', description: 'Beli 2 item dari toko.', objective: 'shop_buy', target: 2,
    rewards: { money: 200, xp: 30 }
  },
]

export const DAILY_QUEST_COUNT = 3 // how many quests assigned per day
