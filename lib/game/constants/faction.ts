export const FACTION_CREATE_COST = 50000
export const FACTION_MAX_MEMBERS = 10
export const FACTION_WAR_COOLDOWN_MS = 4 * 60 * 60 * 1000 // 4 hours

export const FACTION_TERRITORY_BONUSES: Record<string, { label: string; bonus: string }> = {
  city_center: { label: 'Pusat Kota', bonus: '+10% uang dari semua aktivitas' },
  gym_district: { label: 'Distrik Gym', bonus: '+15% hasil latihan gym' },
  business_district: { label: 'Distrik Bisnis', bonus: '+15% gaji kerja' },
  dark_alley: { label: 'Gang Gelap', bonus: '+10% loot memulung & +20% uang combat' },
  hospital: { label: 'Rumah Sakit', bonus: '-30% waktu rawat rumah sakit' },
}
