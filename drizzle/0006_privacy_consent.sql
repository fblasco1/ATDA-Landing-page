ALTER TABLE "membership_requests" ADD COLUMN IF NOT EXISTS "privacy_accepted_at" timestamp with time zone;
