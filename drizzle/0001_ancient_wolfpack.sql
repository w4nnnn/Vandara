CREATE TABLE "scavenge_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"location_id" varchar(50) NOT NULL,
	"result_type" varchar(20) NOT NULL,
	"item_id" varchar(50),
	"quantity" integer,
	"money_amount" integer,
	"event_type" varchar(30),
	"streak" integer DEFAULT 0 NOT NULL,
	"double_mode" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "scavenge_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "scavenge_streak_location" varchar(50);--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "equipped_tool" varchar(50);--> statement-breakpoint
ALTER TABLE "scavenge_logs" ADD CONSTRAINT "scavenge_logs_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;