# Vandara - Text-Based RPG

A single-player browser RPG inspired by Torn City, built with Next.js,
React, and PostgreSQL.

Forge your destiny in a persistent world: customize your character, train
your attributes, scavenge for loot, engage in dynamic combat, and build a
real estate empire.

## 🚀 Features

### Character & Progression

- **Character Creation** — Choose your name and design a unique SVG avatar
  using the Avataaars system with 14 customizable features (hair, face,
  clothing, accessories, skin tone, and more).
- **Dual Leveling** — A main character level (XP exponent 1.5) unlocks jobs
  and content, while an independent scavenge level (XP exponent 1.4) unlocks
  better loot tables and recycling recipes.
- **8 Core Stats** — Train Strength, Dexterity, Constitution, Intelligence,
  Wisdom, Charisma, Luck, and Perception through 24 gym exercises organized
  into 3 categories (Physical, Mental, Special), each with 3 intensity tiers.
- **Derived Combat Stats** — Base stats feed into 4 derived combat metrics
  with soft caps: Crit Chance (LCK + DEX, cap 35%), Dodge Chance (DEX + PER,
  cap 30%), Accuracy (DEX + PER, cap ~98%), and Block Chance (CON + STR,
  cap 25%).
- **Resource Pools** — Max Health (CON + STR), Max Energy (CON + WIS),
  Max Nerve (WIS + PER), and Max Happy (CHA + WIS) scale from your base stats
  with level-based multipliers.
- **8 Tiered Synergies** — Combo bonuses activate when two stats reach
  thresholds (25/50/80), each with 3 progressive tiers:
  Warrior (STR + CON), Shadow (DEX + LCK), Tank (CON + STR),
  Scholar (INT + WIS), Survivor (CON + PER), Hustler (CHA + INT),
  Sentinel (PER + WIS), and Trickster (LCK + CHA).
- **Education System** — Take courses to permanently boost stats and unlock
  abilities (First Aid, Martial Arts, Parkour, Meditation, Advanced Combat,
  and more).
- **Skill Trees** — Unlock permanent passive bonuses in Combat, Stealth, and
  Trading trees using skill points earned on level up.

### Combat & Interaction

- **Dynamic NPC System** — Fight time-seeded, procedurally generated NPCs present in all 10 locations. Location matters: gym bros are stronger, downtown folks are richer, and dark alley thugs carry more weapons.
- **NPC Equipment** — Enemies can probabilistically generate carrying Weapons, Armor, and Accessories, granting them significant hidden stat boosts requiring players to adapt.
- **Turn-based PvE** — Choose between Attack, Heavy Attack, Defend, or Flee.
  Combat factors in STR, DEX, CON, LCK, and PER for hit chance, damage, crits,
  and blocking.
- **Special Moves** — Unlock powerful combat abilities like Power Strike, Leg Sweep, Blade Fury, and Critical Aim as you level up.
- **Pickpocket System** — Test your DEX and PER against NPCs to steal their
  money without fighting. Costs Nerve, rewards cash on success, but
  immediately triggers severe damage and potential hospitalization if caught!
- **Hospitalization** — Lose a fight or get caught pickpocketing with low HP, and you're hospitalized with a recovery timer. All activities are blocked until release.

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
- **5 Location Loot Tables** — Each location has unique drop rates and item pools that scale with your scavenge level.
- **Item Rarity** — 4 tiers (Common, Uncommon, Rare, Epic) with color-coded UI indicators.
- **Scavenge Tools** — Equip a Flashlight (reduces "nothing" drops by 30%),
  Metal Detector (+25% materials, 1.3× money), or Lucky Gloves (+20% rare and epic chance).
- **Streak System** — Consecutive scavenges at the same location grant +0.5%
  loot bonus per action. Resets when you switch locations.
- **Double Mode** — Spend 10 energy instead of 5 for a 30% shift from junk
  and nothing toward useful items.
- **Random Events** — 4 event types roll on each scavenge: Critical Find
  (8%, doubles loot), Treasure Chest (5%, bonus money), Danger (7%, lose HP
  and energy), and NPC Trade (4%, gain money).
- **Scavenge Logs** — The last 15 actions are recorded in the database and
  displayed in a timeline view.

### Inventory, Equipment & Crafting

- **Equipment System** — Equip Weapons, Armor, and Accessories to boost your base combat stats independently.
- **Integrated Crafting Center** — Effortlessly switch between your Backpack inventory and the Crafting/Recycling bench within the same menu.
- **Recycling** — Turn junk into useful items through 6 recipes, each gated by scavenge level:


### Jobs & Economy

- **7 Career Tiers** — Grocer ($50) → Cashier → Mechanic → Security Guard →
  Programmer → Lawyer → Doctor ($1,000). Each tier requires a minimum level
  and costs nerve to work.
- **Contextual Shops** — General Store in the City Center for basics, Black
  Market in the Dark Alley for rare tools and materials.
- **42+ Items** — Consumables, boosters, materials, junk, and tools across
  5 categories.

### Real Estate

- **3 Properties** — Apartment Complex ($50k, $500/hr), Office Building
  ($250k, $3k/hr), Nightclub ($1M, $15k/hr).
- **Passive Income** — Properties generate money every hour. Collect anytime
  to redeem earnings.

### World & Travel

- **10 Locations** — Each offers unique facilities, NPCs, and scavenge loot tables.
- **Fast Travel** — Moving between locations takes 3-18 seconds depending on distance.
- **Random Encounters** — Chance per trip for events like finding dropped
  money or getting mugged.
- **Location Buffs** — 2× Health regen in the Hospital, 2× Happy regen in
  the City Center, and pickpocket risk in the Dark Alley.

### Resource Management

Five player resources regenerate automatically using server-verified
timestamps:

| Resource | Max | Regen Rate        | Used For                  |
|----------|-----|-------------------|---------------------------|
| Energy   | 100 | +5 every 10 min   | Gym, jobs, scavenging     |
| Nerve    | 50  | +1 every 5 min    | Jobs                      |
| Health   | 100 | +5 every 5 min    | Lost in combat and events |
| Happy    | 100 | +5 every 15 min   | General resource          |
| Money    | ∞   | Via jobs/loot/rent | Shop, properties          |

### Bilingual UI

- Full Indonesian and English translations with locale-aware item names,
  event descriptions, and UI labels.
- Toggle language anytime from the top HUD.

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 16 (App Router, Turbopack)  |
| UI         | React 19, shadcn/ui, Tailwind CSS 4 |
| Icons      | Lucide React                        |
| Database   | PostgreSQL + Drizzle ORM            |
| Avatar     | Avataaars SVG components            |
| Language   | TypeScript 5                        |

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set your `DATABASE_URL`.
3. Push the database schema:
   ```bash
   npx drizzle-kit push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```
app/
  actions/                  # Server actions (combat, jobs, scavenge, recycle, etc.)
  (game)/
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
  create/                   # Character creation with avatar builder
lib/
  db/
    schema.ts               # Drizzle ORM table definitions (15+ tables)
    index.ts                # Database connection
  game/
    constants/              # Modular game constants
      items.ts              # Item definitions and rarity
      locations.ts          # Locations, travel times, facilities, NPCs
      gym.ts                # 24 gym exercises (8 stats, 3 categories)
      synergies.ts          # 8 tiered stat synergies (3 tiers each)
      jobs.ts               # Job definitions
      scavenge.ts           # Scavenge constants and loot tables
      education.ts          # Education courses
      skills.ts             # Skill trees and bonuses
      faction.ts            # Faction data
      jail.ts               # Jail system
      marketplace.ts        # Marketplace constants
      ...
    types.ts                # TypeScript type definitions
    utils/
      stats.ts              # Derived stats, soft caps, synergy checks
    npc-generator.ts        # Time-seeded PRNG NPC engine
    regen.ts                # Background stat regeneration
  i18n/
    translations.ts         # Indonesian & English translations (1000+ keys)
components/
  game/                     # Gameplay UI components (regen timer, HUD, etc.)
  ui/                       # shadcn/ui primitives
avataaars-assets/           # SVG avatar rendering system
```

## 📜 License

Private project.

