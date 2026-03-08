-- Add new stat columns  
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "constitution" integer DEFAULT 1 NOT NULL;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "intelligence" integer DEFAULT 1 NOT NULL;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "wisdom" integer DEFAULT 1 NOT NULL;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "charisma" integer DEFAULT 1 NOT NULL;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "luck" integer DEFAULT 1 NOT NULL;
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "perception" integer DEFAULT 1 NOT NULL;

-- Migrate old defense values to constitution  
UPDATE "players" SET "constitution" = "defense" WHERE "defense" > 1;

-- Migrate old speed values to dexterity (add to existing dexterity)
UPDATE "players" SET "dexterity" = "dexterity" + "speed" - 1 WHERE "speed" > 1;

-- Drop old columns  
ALTER TABLE "players" DROP COLUMN IF EXISTS "defense";
ALTER TABLE "players" DROP COLUMN IF EXISTS "speed";
