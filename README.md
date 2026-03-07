# My Game

A single-player browser RPG inspired by Torn City, built with Next.js,
React, and PostgreSQL.

Create a character with a custom avatar, train at the gym, work jobs to
earn money, and manage your inventory — all from your browser.

## Features

- **Character creation** — name your character and customize a unique
  SVG avatar with 13 options (hairstyle, clothes, face, skin, etc.)
- **Dashboard** — view your stats, battle stats, XP progress, and
  balance at a glance
- **Gym** — train Strength, Defense, Speed, or Dexterity using energy
- **Jobs** — apply for jobs (Grocer → Doctor), work to earn money and
  XP, level up to unlock better positions
- **Inventory & shop** — buy consumables (energy drinks, potions),
  use items to restore stats, sell loot for cash

## Tech stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 16 (App Router, Turbopack)  |
| UI         | React 19, shadcn/ui, Tailwind CSS 4 |
| Database   | PostgreSQL + Drizzle ORM            |
| Avatar     | Avataaars SVG components            |
| Language   | TypeScript 5                        |

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or hosted)

### Installation

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your database URL:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set `DATABASE_URL` to your PostgreSQL connection
   string:

   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/mygame
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

## Project structure

```
app/
  page.tsx                  # Landing page (redirects)
  create/page.tsx           # Character creation
  (game)/
    layout.tsx              # Game shell with sidebar
    dashboard/              # Stats overview
    gym/                    # Train battle stats
    jobs/                   # Apply & work jobs
    inventory/              # Items, shop, use/sell
app/actions/                # Server actions (character, gym, jobs, inventory)
lib/db/                     # Drizzle schema & connection
lib/game/constants.ts       # XP formulas, exercises, jobs, items
avataaars-assets/           # SVG avatar component library
components/ui/              # shadcn/ui components
```

## Scripts

| Command           | Description                        |
|-------------------|------------------------------------|
| `npm run dev`     | Start dev server with Turbopack    |
| `npm run build`   | Production build                   |
| `npm start`       | Start production server            |
| `npx drizzle-kit push` | Push schema changes to DB    |

## License

Private project.
