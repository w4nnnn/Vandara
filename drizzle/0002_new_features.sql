-- New features: Combat Expansion, Education, Faction, Marketplace, Jail

-- Player columns for jail
ALTER TABLE "players" ADD COLUMN "is_jailed" boolean NOT NULL DEFAULT false;
ALTER TABLE "players" ADD COLUMN "jail_until" timestamp;
ALTER TABLE "players" ADD COLUMN "jail_reason" varchar(100);

-- Player columns for education
ALTER TABLE "players" ADD COLUMN "active_course_id" varchar(50);
ALTER TABLE "players" ADD COLUMN "course_finish_at" timestamp;

-- Player columns for faction
ALTER TABLE "players" ADD COLUMN "faction_id" integer;

-- Education completed courses
CREATE TABLE IF NOT EXISTS "player_education" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL REFERENCES "players"("id"),
	"course_id" varchar(50) NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);

-- Factions
CREATE TABLE IF NOT EXISTS "factions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL UNIQUE,
	"tag" varchar(5) NOT NULL UNIQUE,
	"leader_id" integer NOT NULL REFERENCES "players"("id"),
	"description" text,
	"money" bigint NOT NULL DEFAULT 0,
	"territory_id" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Faction wars
CREATE TABLE IF NOT EXISTS "faction_wars" (
	"id" serial PRIMARY KEY NOT NULL,
	"attacker_faction_id" integer NOT NULL REFERENCES "factions"("id"),
	"defender_faction_id" integer NOT NULL REFERENCES "factions"("id"),
	"location_id" varchar(50) NOT NULL,
	"winner_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Marketplace listings
CREATE TABLE IF NOT EXISTS "market_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"seller_id" integer NOT NULL REFERENCES "players"("id"),
	"item_id" varchar(50) NOT NULL,
	"quantity" integer NOT NULL DEFAULT 1,
	"price" bigint NOT NULL,
	"active" boolean NOT NULL DEFAULT true,
	"buyer_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sold_at" timestamp
);

-- Jail logs
CREATE TABLE IF NOT EXISTS "jail_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL REFERENCES "players"("id"),
	"reason" varchar(100) NOT NULL,
	"duration" integer NOT NULL,
	"reduced_by" integer NOT NULL DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
