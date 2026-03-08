export interface PropertyDef {
  id: string
  label: string
  locationId: string
  cost: number
  incomePerHour: number
  description: string
}

export const PROPERTIES: Record<string, PropertyDef> = {
  apartment_complex: {
    id: 'apartment_complex',
    label: 'Komplek Apartemen',
    locationId: 'city_center',
    cost: 50000,
    incomePerHour: 500,
    description: 'Blok hunian sederhana dengan pendapatan sewa stabil.',
  },
  office_building: {
    id: 'office_building',
    label: 'Gedung Perkantoran',
    locationId: 'business_district',
    cost: 250000,
    incomePerHour: 3000,
    description: 'Properti komersial yang disewakan ke penyewa korporat.',
  },
  nightclub: {
    id: 'nightclub',
    label: 'Klub Neon Lotus',
    locationId: 'dark_alley',
    cost: 1000000,
    incomePerHour: 15000,
    description: 'Klub malam bawah tanah yang menghasilkan uang besar.',
  },
}
