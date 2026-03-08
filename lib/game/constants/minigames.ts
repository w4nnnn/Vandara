import { LocationId } from './locations'

export interface MiniGameDef {
    id: string
    label: string
    description: string
    icon: string
    minBet: number
    maxBet: number
    nerveCost: number
    locationId?: LocationId
}

export const MINI_GAMES: MiniGameDef[] = [
    { id: 'coin_flip', label: 'Lempar Koin', description: 'Tebak sisi koin. Menang = 2x taruhan.', icon: 'Coins', minBet: 50, maxBet: 5000, nerveCost: 1 },
    { id: 'number_guess', label: 'Tebak Angka', description: 'Tebak angka 1-10. Tepat = 8x taruhan.', icon: 'Dices', minBet: 50, maxBet: 2000, nerveCost: 2 },
    { id: 'lockpick', label: 'Bongkar Kunci', description: 'Pilih pin yang benar. Berhasil = item + uang.', icon: 'KeyRound', minBet: 100, maxBet: 3000, nerveCost: 3, locationId: 'dark_alley' },
]
