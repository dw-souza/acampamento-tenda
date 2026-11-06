ALTER TABLE "camps" ADD COLUMN "server_adult_price_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "camps" ADD COLUMN "server_child_price_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "camps" SET "server_adult_price_cents" = "adult_price_cents", "server_child_price_cents" = "child_price_cents";
