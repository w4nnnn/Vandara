# Vandara - Text-Based RPG

A single-player browser RPG inspired by Torn City, built with Next.js, React, and PostgreSQL.

Forge your destiny in a persistent world: customize your character, train your attributes, scavenge for loot, engage in dynamic combat, and build a real estate empire.

## 🚀 Features

### Character & Progression

- **Character Creation** — Choose your name and design a unique SVG avatar using the Avataaars system with 14 customizable features (hair, face, clothing, accessories, skin tone, and more)
- **Dual Leveling** — A main character level (XP exponent 1.5) unlocks jobs and content, while an independent scavenge level (XP exponent 1.4) unlocks better loot tables and recycling recipes
- **8 Core Stats** — Train Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma, Luck, and Perception through 24 gym exercises organized into 3 categories (Physical, Mental, Special), each with 3 intensity tiers
- **Derived Combat Stats** — Base stats feed into 4 derived combat metrics with soft caps: Crit Chance (LCK + DEX, cap 35%), Dodge Chance (DEX + PER, cap 30%), Accuracy (DEX + PER, cap ~98%), and Block Chance (CON + STR, cap 25%)
- **Resource Pools** — Max Health (CON + STR), Max Energy (CON + WIS), Max Nerve (WIS + PER), and Max Happy (CHA + WIS) scale from your base stats with level-based multipliers
- **8 Tiered Synergies** — Combo bonuses activate when two stats reach thresholds (25/50/80), each with 3 progressive tiers: Warrior (STR + CON), Shadow (DEX + LCK), Tank (CON + STR), Scholar (INT + WIS), Survivor (CON + PER), Hustler (CHA + INT), Sentinel (PER + WIS), and Trickster (LCK + CHA)
- **Education System** — Take courses to permanently boost stats and unlock abilities (First Aid, Martial Arts, Parkour, Meditation, Advanced Combat, and more)
- **Skill Trees** — Unlock permanent passive bonuses in Combat, Stealth, and Trading trees using skill points earned on level up

### Combat & Interaction

- **Dynamic NPC System** — Fight time-seeded, procedurally generated NPCs present in all 10 locations. Location matters: gym bros are stronger, downtown folks are richer, and dark alley thugs carry more weapons
- **NPC Equipment** — Enemies can probabilistically generate carrying Weapons, Armor, and Accessories, granting them significant hidden stat boosts requiring players to adapt
- **Turn-based PvE** — Choose between Attack, Heavy Attack, Defend, or Flee. Combat factors in STR, DEX, CON, LCK, and PER for hit chance, damage, crits, and blocking
- **Special Moves** — Unlock powerful combat abilities like Power Strike, Leg Sweep, Blade Fury, and Critical Aim as you level up
- **Pickpocket System** — Test your DEX and PER against NPCs to steal their money without fighting. Costs Nerve, rewards cash on success, but immediately triggers severe damage and potential hospitalization if caught!
- **Hospitalization** — Lose a fight or get caught pickpocketing with low HP, and you're hospitalized with a recovery timer. All activities are blocked until release

### Scavenging & Exploration

- **10 Locations** — Explore a vast city with unique loot tables and scavenge spots:
  - **City Center** — Cash and consumables, safe starting area
  - **Gym District** — Protein shakes and energy drinks
  - **Business District** — Briefcases and valuable watches
  - **Dark Alley** — Materials, weapons, and high-risk high-reward loot
  - **Hospital** — Medical supplies and bandages
  - **Port Docks** (Level 10) — Cargo containers and fishing boats
  - **University District** (Level 8) — Libraries and computer labs
  - **Industrial Zone** (Level 15) — Factories and mining sites
  - **Waterfront** (Level 20) — Marina and luxury yacht clubs
  - **Underground** (Level 30) — Secret arenas and underground labs
- **5 Location Loot Tables** — Each location has unique drop rates and item pools that scale with your scavenge level
- **Item Rarity** — 4 tiers (Common, Uncommon, Rare, Epic) with color-coded UI indicators
- **Scavenge Tools** — Equip a Flashlight (reduces "nothing" drops by 30%), Metal Detector (+25% money, 1.3× money), or Lucky Gloves (+20% rare and epic chance)
- **Streak System** — Consecutive scavenges at the same location grant +0.5% loot bonus per action. Resets when you switch locations
- **Double Mode** — Spend 10 energy instead of 5 for a 30% shift from junk and nothing toward useful items
- **Random Events** — 4 event types roll on each scavenge: Critical Find (8%, doubles loot), Treasure Chest (5%, bonus money), Danger (7%, lose HP and energy), and NPC Trade (4%, gain money)
- **Scavenge Logs** — The last 15 actions are recorded in the database and displayed in a timeline view

### Inventory, Equipment & Crafting

- **Equipment System** — Equip Weapons, Armor, and Accessories to boost your base combat stats independently
- **Integrated Crafting Center** — Effortlessly switch between your Backpack inventory and the Crafting/Recycling bench within the same menu
- **Recycling** — Turn junk into useful items through recipes, each gated by scavenge level

### Jobs & Economy

- **7 Career Tiers** — Grocer ($50) → Cashier → Mechanic → Security Guard → Programmer → Lawyer → Doctor ($1,000). Each tier requires a minimum level and costs nerve to work
- **Contextual Shops** — General Store in the City Center for basics, Black Market in the Dark Alley for rare tools and materials
- **42+ Items** — Consumables, boosters, materials, junk, and tools across 5 categories

### Real Estate

- **3 Properties** — Apartment Complex ($50k, $500/hr), Office Building ($250k, $3k/hr), Nightclub ($1M, $15k/hr)
- **Passive Income** — Properties generate money every hour. Collect anytime to redeem earnings

### World & Travel

- **10 Locations** — Each offers unique facilities, NPCs, and scavenge loot tables
- **Fast Travel** — Moving between locations takes 3-18 seconds depending on distance
- **Random Encounters** — Chance per trip for events like finding dropped money or getting mugged
- **Location Buffs** — 2× Health regen in the Hospital, 2× Happy regen in the City Center, and pickpocket risk in the Dark Alley

### Resource Management

Five player resources regenerate automatically using server-verified timestamps:

| Resource | Max | Regen Rate        | Used For                  |
|----------|-----|-------------------|---------------------------|
| Energy   | 100 | +5 every 10 min   | Gym, jobs, scavenging     |
| Nerve    | 50  | +1 every 5 min    | Jobs                      |
| Health   | 100 | +5 every 5 min    | Lost in combat and events |
| Happy    | 100 | +5 every 15 min   | General resource          |
| Money    | ∞   | Via jobs/loot/rent | Shop, properties          |

### Additional Systems

- **Faction System** — Create or join factions, engage in faction wars, and control territories
- **Jail System** — Commit crimes and risk imprisonment. Reduce jail time through activities
- **Marketplace** — Trade items with other players through a player-driven marketplace
- **Quest System** — Complete daily quests for rewards and progression
- **Reputation System** — Build reputation in different locations for unique benefits
- **Mini-Games** — Engage in various mini-games for additional rewards

### Bilingual UI

- Full Indonesian and English translations with locale-aware item names, event descriptions, and UI labels
- Toggle language anytime from the top HUD

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 16 (App Router, Turbopack)  |
| UI          | React 19, shadcn/ui, Tailwind CSS 4 |
| Icons       | Lucide React                        |
| Database    | PostgreSQL + Drizzle ORM            |
| Avatar      | Avataaars SVG components            |
| Language    | TypeScript 5                        |
| State       | React Context (i18n, Avatar)        |
| Utilities   | clsx, tailwind-merge, date-fns      |

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your `DATABASE_URL`:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/vandara
   ```

3. Push the database schema:
   ```bash
   npx drizzle-kit push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
app/
  actions/                  # Server actions (20 modules)
    character.ts            # Character management
    combat.ts               # Combat logic
    crafting.ts             # Crafting system
    education.ts            # Education courses
    equipment.ts            # Equipment management
    factions.ts             # Faction operations
    gym.ts                  # Training system
    inventory.ts            # Inventory management
    jail.ts                 # Jail system
    jobs.ts                 # Job system
    marketplace.ts          # Player marketplace
    minigames.ts            # Mini-game logic
    properties.ts           # Real estate system
    quests.ts               # Quest system
    recycle.ts              # Recycling system
    reputation.ts           # Reputation system
    scavenge.ts             # Scavenging system
    shop.ts                 # Shop system
    skills.ts               # Skill tree
    travel.ts               # Travel system
  (game)/                   # Game routes (19 pages)
    dashboard/              # Character stats overview
    travel/                 # Multi-location navigation
    scavenge/               # Loot, tools, streak, events, and logs
    shop/                   # Location-based trade
    properties/             # Real estate management
    npc/                    # Procedural NPC combat
    gym/                    # Attribute training (24 exercises, 3 categories)
    hospital/               # Recovery after defeat
    inventory/              # Item management, tool equipping, recycling
    jobs/                   # Career progression
    education/              # Courses and skill learning
    skills/                 # Skill tree unlocks
    crafting/               # Item crafting and recycling
    marketplace/            # Player trading
    faction/                # Gang/faction management
    jail/                   # Prison system
    equipment/              # Equipment management
    quests/                 # Daily quests
    minigames/              # Mini-game hub
  create/                   # Character creation with avatar builder
  layout.tsx                # Root layout
  page.tsx                  # Landing page
  globals.css               # Global styles

lib/
  db/
    schema.ts               # Drizzle ORM table definitions (15+ tables)
    index.ts                # Database connection
  game/
    constants/              # Modular game constants (20 modules)
      avatar.ts             # Avatar configuration
      combat.ts             # Combat constants
      crafting.ts           # Crafting recipes
      education.ts          # Education courses
      equipment.ts          # Equipment definitions
      faction.ts            # Faction data
      gym.ts                # 24 gym exercises
      items.ts              # Item definitions and rarity
      jail.ts               # Jail system
      jobs.ts               # Job definitions
      locations.ts          # Locations, travel times, facilities
      marketplace.ts        # Marketplace constants
      minigames.ts          # Mini-game data
      properties.ts         # Property definitions
      quests.ts             # Quest definitions
      reputation.ts         # Reputation system
      scavenge.ts           # Scavenge constants and loot tables
      skills.ts             # Skill trees and bonuses
      synergies.ts          # 8 tiered stat synergies
      xp.ts                 # XP curves and formulas
    utils/
      stats.ts              # Derived stats, soft caps, synergy checks
    npc-generator.ts        # Time-seeded PRNG NPC engine
    regen.ts                # Background stat regeneration
    types.ts                # TypeScript type definitions (400+ lines)
  i18n/
    context.tsx             # i18n context provider
    index.ts                # i18n utilities
    translations.ts         # Indonesian & English translations (1000+ keys)
  avataaars/
    AvatarContext.tsx       # Avatar context provider
    index.tsx               # Avatar component exports
    avatar/                 # Avatar SVG components
    options/                # Avatar feature options
  utils.ts                  # Utility functions (cn helper)

components/
  game/                     # Gameplay UI components (9 modules)
    regen-timer.tsx         # Resource regeneration timer
    hud.tsx                 # Heads-up display
    bottom-nav.tsx          # Mobile navigation
    combat-bonuses.tsx      # Combat bonus display
    encounter-alert.tsx     # Encounter notifications
    health-bar.tsx          # Health visualization
    location-nav.tsx        # Location navigation
    rarity-badge.tsx        # Item rarity indicator
    tool-effects.tsx        # Tool effect display
  ui/                       # shadcn/ui primitives (50+ modules)
    button.tsx
    card.tsx
    dialog.tsx
    progress.tsx
    ...

drizzle/
  meta/                     # Drizzle migration metadata
  0000_square_cyclops.sql   # Initial schema
  0001_ancient_wolfpack.sql # Player avatars & items
  0002_new_features.sql     # Additional features
  0003_add_stats.sql        # Stats additions
```

## 🗄️ Database Schema

The game uses 15+ PostgreSQL tables:

| Table               | Description                          |
|---------------------|--------------------------------------|
| `players`           | Core player data (stats, resources, location, state) |
| `player_avatars`    | Character appearance configuration   |
| `player_items`      | Inventory items                      |
| `player_properties` | Owned real estate                    |
| `player_quests`     | Quest progress                       |
| `player_reputation` | Location reputation                  |
| `player_education`  | Completed courses                    |
| `factions`          | Faction data                         |
| `faction_wars`      | War history                          |
| `market_listings`   | Marketplace listings                 |
| `jail_logs`         | Imprisonment records                 |
| `gym_logs`          | Training history                     |
| `job_logs`          | Work history                         |
| `combat_logs`       | Combat history                       |
| `scavenge_logs`     | Scavenging history                   |

## 📋 Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎮 Game Routes

| Route          | Description                              |
|----------------|------------------------------------------|
| `/`            | Landing page                             |
| `/create`      | Character creation                       |
| `/dashboard`   | Character stats overview                 |
| `/travel`      | Location navigation                      |
| `/scavenge`    | Loot hunting                             |
| `/shop`        | Item trading                             |
| `/properties`  | Real estate management                   |
| `/npc`         | NPC combat                               |
| `/gym`         | Stat training                            |
| `/hospital`    | Recovery                                 |
| `/inventory`   | Item management                          |
| `/jobs`        | Career progression                       |
| `/education`   | Courses                                  |
| `/skills`      | Skill trees                              |
| `/crafting`    | Crafting & recycling                     |
| `/marketplace` | Player trading                           |
| `/faction`     | Faction management                       |
| `/jail`        | Prison system                            |
| `/equipment`   | Equipment management                     |
| `/quests`      | Daily quests                             |
| `/minigames`   | Mini-game hub                            |

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vandara
```

## 📜 License

Private project.
