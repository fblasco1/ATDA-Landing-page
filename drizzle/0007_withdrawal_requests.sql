CREATE TABLE IF NOT EXISTS "withdrawal_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(16) NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"dni" varchar(32) NOT NULL,
	"purchase" varchar(255) NOT NULL,
	"details" text,
	"status" varchar(16) DEFAULT 'received' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "withdrawal_requests_code_uidx" ON "withdrawal_requests" USING btree ("code");
