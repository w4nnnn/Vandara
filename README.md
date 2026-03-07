# My Game

A single-player browser RPG inspired by Torn City, built with Next.js, React, and PostgreSQL.

Forge your destiny in a persistent world: customize your character, train your attributes, engage in dynamic combat, and build a real estate empire.

## 🚀 Features

### Core Gameplay
- **Character Creation & Customization** — Choose your name and design a unique SVG avatar using the Avataaars system with 13+ customizable features.
- **Dynamic NPC System** — Fight against time-seeded, procedurally generated NPCs. Every hour brings new enemies with unique stats, names, and visual appearances.
- **Battle Stats & Training** — Train Strength, Defense, Speed, and Dexterity in the Gym to climb the ranks.
- **Combat (PvE)** — Tactical turn-based combat featuring status effects, critical hits, and procedural loot drops.
- **Career Path** — Work jobs ranging from a local Grocer to a high-earning Doctor. Rank up to unlock better pay and XP rewards.

### Exploration & Economy
- **Multi-Location Travel** — Explore the City Center, Gym District, Business District, Dark Alley, and Hospital. Each location unlocks unique facilities.
- **Scavenging System** — Search areas for loot. Every location has unique loot tables (found cash in City Center, scrap in Dark Alley, medical supplies in the Hospital).
- **Contextual Shops** — Visit the **General Store** in the City Center for basics, or find the **Black Market** in the Dark Alley for elite boosters (with location-specific pricing).
- **Real Estate & Passive Income** — Buy properties like Apartment Complexes, Office Buildings, or Nightclubs to generate passive income hourly.
- **Random Encounters** — Watch out during travel! 1% chance for random events like finding dropped money or getting mugged on the way.

### Immersive Systems
- **Location Buffs & Risks** — Your current location matters. Get 2x Health regeneration in the Hospital, 2x Happy regeneration in the City Center, or risk being pickpocketed in the Dark Alley.
- **Real-time Synchronization** — Energy, Nerve, Health, and Happiness regenerate automatically in the background using server-verified timestamps.
- **Professional UI** — Built with **Lucide React** icons and a sleek, dashboard-style interface optimized for both mobile and desktop.

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
  actions/                  # Server actions (combat, scavenging, properties, etc.)
  (game)/
    dashboard/              # Stats overview
    travel/                 # Multi-location navigation
    scavenge/               # Looting system
    shop/                   # Location-based trade
    properties/             # Real estate dashboard
    npc/                    # Dynamic enemy encounters
    gym/                    # Attribute training
lib/
  db/                       # Schema & Drizzle setup
  game/
    npc-generator.ts        # Time-seeded PRNG engine
    regen.ts                # Background stat calculation
    constants.ts            # Game balance & metadata
components/
  game/                     # Specialized gameplay components
  ui/                       # Layout & primitives
```

## 📜 License
Private project.

