ALTER TABLE "membership_requests" ADD COLUMN IF NOT EXISTS "profession" varchar(200);--> statement-breakpoint
ALTER TABLE "membership_requests" ALTER COLUMN "motivation" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "profession" varchar(200);
