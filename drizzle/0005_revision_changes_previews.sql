ALTER TABLE "content_revisions" ADD COLUMN IF NOT EXISTS "changes" jsonb;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_previews" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" varchar(64) NOT NULL,
	"data" jsonb NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_previews_token_unique" UNIQUE("token")
);
