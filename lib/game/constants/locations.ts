export type LocationId =
  | 'city_center'
  | 'gym_district'
  | 'business_district'
  | 'dark_alley'
  | 'hospital'
  | 'port_docks'
  | 'university_district'
  | 'industrial_zone'
  | 'waterfront'
  | 'underground'

export interface Location {
  id: LocationId
  label: string
  description: string
  facilities: string[]  // what you can do here
}

export const LOCATIONS: Partial<Record<LocationId, Location>> = {
  city_center: {
    id: 'city_center',
    label: 'Pusat Kota',
    description: 'Jantung kota. Titik awal yang aman.',
    facilities: ['scavenge', 'shop', 'properties', 'npc', 'marketplace', 'education'],
  },
  gym_district: {
    id: 'gym_district',
    label: 'Distrik Gym',
    description: 'Distrik penuh fasilitas latihan dan dojo.',
    facilities: ['gym', 'scavenge', 'npc', 'education'],
  },
  business_district: {
    id: 'business_district',
    label: 'Distrik Bisnis',
    description: 'Kantor perusahaan dan peluang kerja.',
    facilities: ['jobs', 'scavenge', 'properties', 'npc', 'marketplace'],
  },
  dark_alley: {
    id: 'dark_alley',
    label: 'Gang Gelap',
    description: 'Bagian kota yang berbahaya. Hati-hati.',
    facilities: ['npc', 'scavenge', 'shop', 'properties', 'faction', 'jail'],
  },
  hospital: {
    id: 'hospital',
    label: 'Rumah Sakit',
    description: 'Rumah sakit kota. Datang untuk pemulihan.',
    facilities: ['hospital', 'scavenge'],
  },
}

export const LOCATION_IDS = Object.keys(LOCATIONS) as LocationId[]

// Travel times between locations (in seconds)
// Symmetric: time from A→B = time from B→A
export const TRAVEL_TIMES: Partial<Record<LocationId, Partial<Record<LocationId, number>>>> = {
  city_center: { city_center: 0, gym_district: 3, business_district: 4, dark_alley: 6, hospital: 5 },
  gym_district: { city_center: 3, gym_district: 0, business_district: 5, dark_alley: 7, hospital: 6 },
  business_district: { city_center: 4, gym_district: 5, business_district: 0, dark_alley: 8, hospital: 4 },
  dark_alley: { city_center: 6, gym_district: 7, business_district: 8, dark_alley: 0, hospital: 9 },
  hospital: { city_center: 5, gym_district: 6, business_district: 4, dark_alley: 9, hospital: 0 },
}

export const ACTIVITY_LOCATIONS: Record<string, LocationId> = {
  gym: 'gym_district',
  jobs: 'business_district',
  combat: 'dark_alley',
  hospital: 'hospital',
}

// Facility name → route + icon key (icons resolved in client code)
export const FACILITY_ROUTES: Record<string, { href: string; iconKey: string }> = {
  'scavenge': { href: '/scavenge', iconKey: 'Search' },
  'shop': { href: '/shop', iconKey: 'Store' },
  'properties': { href: '/properties', iconKey: 'Building' },
  'npc': { href: '/npc', iconKey: 'Users' },
  'marketplace': { href: '/marketplace', iconKey: 'ShoppingBag' },
  'education': { href: '/education', iconKey: 'GraduationCap' },
  'gym': { href: '/gym', iconKey: 'Dumbbell' },
  'jobs': { href: '/jobs', iconKey: 'Briefcase' },
  'hospital': { href: '/hospital', iconKey: 'HeartPulse' },
  'jail': { href: '/jail', iconKey: 'Lock' },
  'faction': { href: '/faction', iconKey: 'Shield' },
}
