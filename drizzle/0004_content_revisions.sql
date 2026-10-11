CREATE TABLE IF NOT EXISTS "content_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(128) NOT NULL,
	"document_type" varchar(64) NOT NULL,
	"title" varchar(255),
	"action" varchar(16) NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "content_revisions_document_idx" ON "content_revisions" USING btree ("document_id","created_at");
