CREATE TYPE "public"."member_status" AS ENUM('active', 'suspended', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."membership_fee_status" AS ENUM('pending', 'paid', 'overdue', 'waived');--> statement-breakpoint
CREATE TYPE "public"."membership_request_status" AS ENUM('received', 'reviewing', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"sanity_enrollment_id" varchar(128) NOT NULL,
	"member_id" integer,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(200),
	"course_title" varchar(255),
	"course_slug" varchar(255),
	"amount_cents" integer,
	"currency" varchar(8) DEFAULT 'ARS',
	"payment_status" varchar(32) DEFAULT 'pending' NOT NULL,
	"classroom_access" varchar(32) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"dni" varchar(32) NOT NULL,
	"phone" varchar(64),
	"organization" varchar(255),
	"role_title" varchar(255),
	"status" "member_status" DEFAULT 'active' NOT NULL,
	"membership_request_id" integer,
	"notes" text,
	"auth_user_id" varchar(128),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" integer NOT NULL,
	"period" varchar(7) NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(8) DEFAULT 'ARS' NOT NULL,
	"status" "membership_fee_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"dni" varchar(32) NOT NULL,
	"phone" varchar(64) NOT NULL,
	"organization" varchar(255),
	"role_title" varchar(255),
	"motivation" text NOT NULL,
	"status" "membership_request_status" DEFAULT 'received' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_membership_request_id_membership_requests_id_fk" FOREIGN KEY ("membership_request_id") REFERENCES "public"."membership_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_fees" ADD CONSTRAINT "membership_fees_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_enrollments_sanity_uidx" ON "course_enrollments" USING btree ("sanity_enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "members_email_uidx" ON "members" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "members_dni_uidx" ON "members" USING btree ("dni");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_fees_member_period_uidx" ON "membership_fees" USING btree ("member_id","period");