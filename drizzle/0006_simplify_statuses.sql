ALTER TABLE "camps" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
-- Em preparação, inscrições abertas e encerradas viram "agendado"; realizado continua.
UPDATE "camps" SET "status" = 'scheduled' WHERE "status" <> 'finished';--> statement-breakpoint
ALTER TABLE "camps" ALTER COLUMN "status" SET DEFAULT 'scheduled'::text;--> statement-breakpoint
DROP TYPE "public"."camp_status";--> statement-breakpoint
CREATE TYPE "public"."camp_status" AS ENUM('scheduled', 'finished');--> statement-breakpoint
ALTER TABLE "camps" ALTER COLUMN "status" SET DEFAULT 'scheduled'::"public"."camp_status";--> statement-breakpoint
ALTER TABLE "camps" ALTER COLUMN "status" SET DATA TYPE "public"."camp_status" USING "status"::"public"."camp_status";--> statement-breakpoint
ALTER TABLE "camp_participants" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
-- Inscrição pendente deixa de existir (inscrição é num dia só): vira inscrita.
UPDATE "camp_participants" SET "status" = 'confirmed' WHERE "status" = 'pending';--> statement-breakpoint
ALTER TABLE "camp_participants" ALTER COLUMN "status" SET DEFAULT 'confirmed'::text;--> statement-breakpoint
DROP TYPE "public"."participant_status";--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('confirmed', 'waitlist', 'cancelled');--> statement-breakpoint
ALTER TABLE "camp_participants" ALTER COLUMN "status" SET DEFAULT 'confirmed'::"public"."participant_status";--> statement-breakpoint
ALTER TABLE "camp_participants" ALTER COLUMN "status" SET DATA TYPE "public"."participant_status" USING "status"::"public"."participant_status";