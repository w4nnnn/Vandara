import { pgTable, serial, varchar, integer, bigint, timestamp, boolean } from 'drizzle-orm/pg-core'

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  level: integer('level').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  money: bigint('money', { mode: 'number' }).notNull().default(1000),
  energy: integer('energy').notNull().default(100),
  maxEnergy: integer('max_energy').notNull().default(100),
  nerve: integer('nerve').notNull().default(50),
  maxNerve: integer('max_nerve').notNull().default(50),
  health: integer('health').notNull().default(100),
  maxHealth: integer('max_health').notNull().default(100),
  happy: integer('happy').notNull().default(100),
  maxHappy: integer('max_happy').notNull().default(100),
  strength: integer('strength').notNull().default(1),
  defense: integer('defense').notNull().default(1),
  speed: integer('speed').notNull().default(1),
  dexterity: integer('dexterity').notNull().default(1),
  jobId: varchar('job_id', { length: 50 }),
  isHospitalized: boolean('is_hospitalized').notNull().default(false),
  hospitalUntil: timestamp('hospital_until'),
  currentLocation: varchar('current_location', { length: 50 }).notNull().default('city_center'),
  travelingTo: varchar('traveling_to', { length: 50 }),
  travelingUntil: timestamp('traveling_until'),
  lastEncounterMsg: varchar('last_encounter_msg', { length: 255 }),
  scavengeLevel: integer('scavenge_level').notNull().default(1),
  scavengeXp: integer('scavenge_xp').notNull().default(0),
  scavengeStreak: integer('scavenge_streak').notNull().default(0),
  scavengeStreakLocation: varchar('scavenge_streak_location', { length: 50 }),
  equippedTool: varchar('equipped_tool', { length: 50 }),
  // Equipment slots
  equippedWeapon: varchar('equipped_weapon', { length: 50 }),
  equippedArmor: varchar('equipped_armor', { length: 50 }),
  equippedAccessory: varchar('equipped_accessory', { length: 50 }),
  // Skill tree
  skillPoints: integer('skill_points').notNull().default(0),
  unlockedSkills: varchar('unlocked_skills', { length: 500 }).notNull().default('[]'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const playerAvatars = pgTable('player_avatars', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  avatarStyle: varchar('avatar_style', { length: 50 }).notNull().default('Circle'),
  topType: varchar('top_type', { length: 50 }).notNull().default('LongHairStraight'),
  accessoriesType: varchar('accessories_type', { length: 50 }).notNull().default('Blank'),
  hatColor: varchar('hat_color', { length: 50 }).notNull().default('Gray01'),
  hairColor: varchar('hair_color', { length: 50 }).notNull().default('BrownDark'),
  facialHairType: varchar('facial_hair_type', { length: 50 }).notNull().default('Blank'),
  facialHairColor: varchar('facial_hair_color', { length: 50 }).notNull().default('BrownDark'),
  clotheType: varchar('clothe_type', { length: 50 }).notNull().default('BlazerShirt'),
  clotheColor: varchar('clothe_color', { length: 50 }).notNull().default('Gray01'),
  graphicType: varchar('graphic_type', { length: 50 }).notNull().default('Skull'),
  eyeType: varchar('eye_type', { length: 50 }).notNull().default('Default'),
  eyebrowType: varchar('eyebrow_type', { length: 50 }).notNull().default('Default'),
  mouthType: varchar('mouth_type', { length: 50 }).notNull().default('Default'),
  skinColor: varchar('skin_color', { length: 50 }).notNull().default('Light'),
})

// Inventory items
export const playerItems = pgTable('player_items', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  itemId: varchar('item_id', { length: 50 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
})

// Gym training log
export const gymLogs = pgTable('gym_logs', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  stat: varchar('stat', { length: 20 }).notNull(),
  gained: integer('gained').notNull(),
  energySpent: integer('energy_spent').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Job work log
export const jobLogs = pgTable('job_logs', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  jobId: varchar('job_id', { length: 50 }).notNull(),
  moneyEarned: integer('money_earned').notNull(),
  xpEarned: integer('xp_earned').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Combat log
export const combatLogs = pgTable('combat_logs', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  enemyId: varchar('enemy_id', { length: 50 }).notNull(),
  won: boolean('won').notNull(),
  damageDealt: integer('damage_dealt').notNull(),
  damageTaken: integer('damage_taken').notNull(),
  moneyEarned: integer('money_earned').notNull().default(0),
  xpEarned: integer('xp_earned').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Scavenge logs
export const scavengeLogs = pgTable('scavenge_logs', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  locationId: varchar('location_id', { length: 50 }).notNull(),
  resultType: varchar('result_type', { length: 20 }).notNull(), // 'item' | 'money' | 'none'
  itemId: varchar('item_id', { length: 50 }),
  quantity: integer('quantity'),
  moneyAmount: integer('money_amount'),
  eventType: varchar('event_type', { length: 30 }),
  streak: integer('streak').notNull().default(0),
  doubleMode: boolean('double_mode').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Real Estate Properties
export const playerProperties = pgTable('player_properties', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  propertyId: varchar('property_id', { length: 50 }).notNull(),
  lastCollectedAt: timestamp('last_collected_at').notNull().defaultNow(),
})

// Player Quests
export const playerQuests = pgTable('player_quests', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  questId: varchar('quest_id', { length: 50 }).notNull(),
  progress: integer('progress').notNull().default(0),
  completed: boolean('completed').notNull().default(false),
  claimed: boolean('claimed').notNull().default(false),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
})

// Player Reputation per location
export const playerReputation = pgTable('player_reputation', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id')
    .notNull()
    .references(() => players.id),
  locationId: varchar('location_id', { length: 50 }).notNull(),
  reputation: integer('reputation').notNull().default(0),
})
