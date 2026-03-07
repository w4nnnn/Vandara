CREATE TABLE "combat_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"enemy_id" varchar(50) NOT NULL,
	"won" boolean NOT NULL,
	"damage_dealt" integer NOT NULL,
	"damage_taken" integer NOT NULL,
	"money_earned" integer DEFAULT 0 NOT NULL,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gym_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"stat" varchar(20) NOT NULL,
	"gained" integer NOT NULL,
	"energy_spent" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"job_id" varchar(50) NOT NULL,
	"money_earned" integer NOT NULL,
	"xp_earned" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_avatars" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"avatar_style" varchar(50) DEFAULT 'Circle' NOT NULL,
	"top_type" varchar(50) DEFAULT 'LongHairStraight' NOT NULL,
	"accessories_type" varchar(50) DEFAULT 'Blank' NOT NULL,
	"hat_color" varchar(50) DEFAULT 'Gray01' NOT NULL,
	"hair_color" varchar(50) DEFAULT 'BrownDark' NOT NULL,
	"facial_hair_type" varchar(50) DEFAULT 'Blank' NOT NULL,
	"facial_hair_color" varchar(50) DEFAULT 'BrownDark' NOT NULL,
	"clothe_type" varchar(50) DEFAULT 'BlazerShirt' NOT NULL,
	"clothe_color" varchar(50) DEFAULT 'Gray01' NOT NULL,
	"graphic_type" varchar(50) DEFAULT 'Skull' NOT NULL,
	"eye_type" varchar(50) DEFAULT 'Default' NOT NULL,
	"eyebrow_type" varchar(50) DEFAULT 'Default' NOT NULL,
	"mouth_type" varchar(50) DEFAULT 'Default' NOT NULL,
	"skin_color" varchar(50) DEFAULT 'Light' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"item_id" varchar(50) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"property_id" varchar(50) NOT NULL,
	"last_collected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" integer DEFAULT 0 NOT NULL,
	"money" bigint DEFAULT 1000 NOT NULL,
	"energy" integer DEFAULT 100 NOT NULL,
	"max_energy" integer DEFAULT 100 NOT NULL,
	"nerve" integer DEFAULT 50 NOT NULL,
	"max_nerve" integer DEFAULT 50 NOT NULL,
	"health" integer DEFAULT 100 NOT NULL,
	"max_health" integer DEFAULT 100 NOT NULL,
	"happy" integer DEFAULT 100 NOT NULL,
	"max_happy" integer DEFAULT 100 NOT NULL,
	"strength" integer DEFAULT 1 NOT NULL,
	"defense" integer DEFAULT 1 NOT NULL,
	"speed" integer DEFAULT 1 NOT NULL,
	"dexterity" integer DEFAULT 1 NOT NULL,
	"job_id" varchar(50),
	"is_hospitalized" boolean DEFAULT false NOT NULL,
	"hospital_until" timestamp,
	"current_location" varchar(50) DEFAULT 'city_center' NOT NULL,
	"traveling_to" varchar(50),
	"traveling_until" timestamp,
	"last_encounter_msg" varchar(255),
	"scavenge_level" integer DEFAULT 1 NOT NULL,
	"scavenge_xp" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "players_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "combat_logs" ADD CONSTRAINT "combat_logs_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_logs" ADD CONSTRAINT "gym_logs_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_logs" ADD CONSTRAINT "job_logs_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_avatars" ADD CONSTRAINT "player_avatars_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_items" ADD CONSTRAINT "player_items_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_properties" ADD CONSTRAINT "player_properties_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;