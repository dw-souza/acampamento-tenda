CREATE TYPE "public"."user_role" AS ENUM('admin', 'guardian');--> statement-breakpoint
CREATE TYPE "public"."camp_status" AS ENUM('draft', 'open', 'closed', 'finished');--> statement-breakpoint
CREATE TYPE "public"."participant_role" AS ENUM('camper', 'server');--> statement-breakpoint
CREATE TYPE "public"."participant_status" AS ENUM('pending', 'confirmed', 'waitlist', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('pix', 'cash');--> statement-breakpoint
CREATE TYPE "public"."person_role" AS ENUM('husband', 'wife', 'child');--> statement-breakpoint
CREATE TYPE "public"."person_status" AS ENUM('active', 'deceased', 'left');--> statement-breakpoint
CREATE TYPE "public"."team_kind" AS ENUM('tent', 'special');--> statement-breakpoint
CREATE TYPE "public"."tent_status" AS ENUM('forming', 'active', 'inactive');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "camp_attendees" (
	"participant_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	CONSTRAINT "camp_attendees_participant_id_person_id_pk" PRIMARY KEY("participant_id","person_id")
);
--> statement-breakpoint
CREATE TABLE "camp_parishes" (
	"camp_id" uuid NOT NULL,
	"parish_id" uuid NOT NULL,
	"forming_tent_id" uuid,
	CONSTRAINT "camp_parishes_camp_id_parish_id_pk" PRIMARY KEY("camp_id","parish_id")
);
--> statement-breakpoint
CREATE TABLE "camp_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"camp_id" uuid NOT NULL,
	"family_id" uuid NOT NULL,
	"role" "participant_role" NOT NULL,
	"team_id" uuid,
	"is_coordinator" boolean DEFAULT false NOT NULL,
	"status" "participant_status" DEFAULT 'confirmed' NOT NULL,
	"payment_method" "payment_method",
	"paid_cents" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "camp_participants_campId_familyId_unique" UNIQUE("camp_id","family_id")
);
--> statement-breakpoint
CREATE TABLE "camp_tents" (
	"camp_id" uuid NOT NULL,
	"tent_id" uuid NOT NULL,
	"role" "participant_role" NOT NULL,
	"team_id" uuid,
	CONSTRAINT "camp_tents_camp_id_tent_id_pk" PRIMARY KEY("camp_id","tent_id")
);
--> statement-breakpoint
CREATE TABLE "camps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stage_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"adult_price_cents" integer DEFAULT 0 NOT NULL,
	"child_price_cents" integer DEFAULT 0 NOT NULL,
	"expected_families" integer,
	"status" "camp_status" DEFAULT 'draft' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parish_id" uuid NOT NULL,
	"tent_id" uuid,
	"address" text,
	"neighborhood" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"wedding_date" date,
	"main_contact_role" "person_role" DEFAULT 'husband' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"address" text,
	"zip_code" text,
	"phone" text,
	"email" text,
	"responsible_name" text,
	"responsible_phone" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_id" uuid NOT NULL,
	"role" "person_role" NOT NULL,
	"full_name" text NOT NULL,
	"badge_name" text,
	"birth_date" date,
	"phone" text,
	"email" text,
	"profession" text,
	"dietary_restrictions" text,
	"special_needs" text,
	"status" "person_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	"has_camp" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stages_name_unique" UNIQUE("name"),
	CONSTRAINT "stages_position_unique" UNIQUE("position")
);
--> statement-breakpoint
CREATE TABLE "tent_stage_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tent_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"camp_id" uuid,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tent_stage_history_tentId_stageId_unique" UNIQUE("tent_id","stage_id")
);
--> statement-breakpoint
CREATE TABLE "tents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parish_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"name" text,
	"status" "tent_status" DEFAULT 'forming' NOT NULL,
	"current_stage_id" uuid,
	"guardian_family_id" uuid,
	"meeting_schedule" text,
	"meeting_location" text,
	"formed_at" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tents_parishId_number_unique" UNIQUE("parish_id","number")
);
--> statement-breakpoint
CREATE TABLE "work_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"kind" "team_kind" NOT NULL,
	"color" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "work_teams_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_attendees" ADD CONSTRAINT "camp_attendees_participant_id_camp_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."camp_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_attendees" ADD CONSTRAINT "camp_attendees_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_parishes" ADD CONSTRAINT "camp_parishes_camp_id_camps_id_fk" FOREIGN KEY ("camp_id") REFERENCES "public"."camps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_parishes" ADD CONSTRAINT "camp_parishes_parish_id_parishes_id_fk" FOREIGN KEY ("parish_id") REFERENCES "public"."parishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_parishes" ADD CONSTRAINT "camp_parishes_forming_tent_id_tents_id_fk" FOREIGN KEY ("forming_tent_id") REFERENCES "public"."tents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_participants" ADD CONSTRAINT "camp_participants_camp_id_camps_id_fk" FOREIGN KEY ("camp_id") REFERENCES "public"."camps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_participants" ADD CONSTRAINT "camp_participants_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_participants" ADD CONSTRAINT "camp_participants_team_id_work_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."work_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_tents" ADD CONSTRAINT "camp_tents_camp_id_camps_id_fk" FOREIGN KEY ("camp_id") REFERENCES "public"."camps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_tents" ADD CONSTRAINT "camp_tents_tent_id_tents_id_fk" FOREIGN KEY ("tent_id") REFERENCES "public"."tents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_tents" ADD CONSTRAINT "camp_tents_team_id_work_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."work_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camps" ADD CONSTRAINT "camps_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "families" ADD CONSTRAINT "families_parish_id_parishes_id_fk" FOREIGN KEY ("parish_id") REFERENCES "public"."parishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "families" ADD CONSTRAINT "families_tent_id_tents_id_fk" FOREIGN KEY ("tent_id") REFERENCES "public"."tents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tent_stage_history" ADD CONSTRAINT "tent_stage_history_tent_id_tents_id_fk" FOREIGN KEY ("tent_id") REFERENCES "public"."tents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tent_stage_history" ADD CONSTRAINT "tent_stage_history_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tent_stage_history" ADD CONSTRAINT "tent_stage_history_camp_id_camps_id_fk" FOREIGN KEY ("camp_id") REFERENCES "public"."camps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tents" ADD CONSTRAINT "tents_parish_id_parishes_id_fk" FOREIGN KEY ("parish_id") REFERENCES "public"."parishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tents" ADD CONSTRAINT "tents_current_stage_id_stages_id_fk" FOREIGN KEY ("current_stage_id") REFERENCES "public"."stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tents" ADD CONSTRAINT "tents_guardian_family_id_families_id_fk" FOREIGN KEY ("guardian_family_id") REFERENCES "public"."families"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "camp_participants_camp_id_index" ON "camp_participants" USING btree ("camp_id");--> statement-breakpoint
CREATE INDEX "families_tent_id_index" ON "families" USING btree ("tent_id");--> statement-breakpoint
CREATE INDEX "families_parish_id_index" ON "families" USING btree ("parish_id");--> statement-breakpoint
CREATE INDEX "people_family_id_index" ON "people" USING btree ("family_id");