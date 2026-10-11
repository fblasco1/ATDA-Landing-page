import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const membershipRequestStatusEnum = pgEnum("membership_request_status", [
  "received",
  "reviewing",
  "approved",
  "rejected",
]);

export const memberStatusEnum = pgEnum("member_status", ["active", "suspended", "inactive"]);

export const membershipFeeStatusEnum = pgEnum("membership_fee_status", [
  "pending",
  "paid",
  "overdue",
  "waived",
]);

export const membershipRequests = pgTable("membership_requests", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  dni: varchar("dni", { length: 32 }).notNull(),
  phone: varchar("phone", { length: 64 }).notNull(),
  /** Obligatoria en el formulario; nula solo en solicitudes previas al campo. */
  profession: varchar("profession", { length: 200 }),
  organization: varchar("organization", { length: 255 }),
  roleTitle: varchar("role_title", { length: 255 }),
  motivation: text("motivation"),
  status: membershipRequestStatusEnum("status").notNull().default("received"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const members = pgTable(
  "members",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 200 }).notNull(),
    dni: varchar("dni", { length: 32 }).notNull(),
    phone: varchar("phone", { length: 64 }),
    profession: varchar("profession", { length: 200 }),
    organization: varchar("organization", { length: 255 }),
    roleTitle: varchar("role_title", { length: 255 }),
    status: memberStatusEnum("status").notNull().default("active"),
    membershipRequestId: integer("membership_request_id").references(() => membershipRequests.id),
    notes: text("notes"),
    /** bcrypt hash — vacío hasta que el socio active el acceso en /socio/activar */
    passwordHash: varchar("password_hash", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("members_email_uidx").on(table.email), uniqueIndex("members_dni_uidx").on(table.dni)],
);

export const membershipFees = pgTable(
  "membership_fees",
  {
    id: serial("id").primaryKey(),
    memberId: integer("member_id")
      .notNull()
      .references(() => members.id),
    /** Periodo YYYY-MM */
    period: varchar("period", { length: 7 }).notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("ARS"),
    status: membershipFeeStatusEnum("status").notNull().default("pending"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("membership_fees_member_period_uidx").on(table.memberId, table.period)],
);

/** Espejo ligero de inscripciones Sanity; Sanity sigue siendo fuente del checkout. */
export const courseEnrollments = pgTable(
  "course_enrollments",
  {
    id: serial("id").primaryKey(),
    sanityEnrollmentId: varchar("sanity_enrollment_id", { length: 128 }).notNull(),
    memberId: integer("member_id").references(() => members.id),
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 200 }),
    courseTitle: varchar("course_title", { length: 255 }),
    courseSlug: varchar("course_slug", { length: 255 }),
    amountCents: integer("amount_cents"),
    currency: varchar("currency", { length: 8 }).default("ARS"),
    paymentStatus: varchar("payment_status", { length: 32 }).notNull().default("pending"),
    classroomAccess: varchar("classroom_access", { length: 32 }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("course_enrollments_sanity_uidx").on(table.sanityEnrollmentId)],
);

/** Admins con email y contraseña (además de los de Google en ADMIN_EMAILS). */
export const adminUsers = pgTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 200 }),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    mustChangePassword: boolean("must_change_password").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("admin_users_email_uidx").on(table.email)],
);

/** Copia de un documento de Sanity tomada antes de editarlo, borrarlo o restaurarlo desde el panel. */
export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: serial("id").primaryKey(),
    documentId: varchar("document_id", { length: 128 }).notNull(),
    documentType: varchar("document_type", { length: 64 }).notNull(),
    title: varchar("title", { length: 255 }),
    /** Qué se hizo después de tomar la copia: update | delete | restore */
    action: varchar("action", { length: 16 }).notNull(),
    snapshot: jsonb("snapshot").notNull(),
    /** Resumen legible de lo que cambió: [{ label, detail }] */
    changes: jsonb("changes").$type<{ label: string; detail?: string }[]>(),
    createdBy: varchar("created_by", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("content_revisions_document_idx").on(table.documentId, table.createdAt)],
);

/** Contenido sin guardar que un admin está previsualizando en el sitio. */
export const contentPreviews = pgTable("content_previews", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  data: jsonb("data").notNull(),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type ContentRevision = typeof contentRevisions.$inferSelect;
export type MembershipRequest = typeof membershipRequests.$inferSelect;
export type Member = typeof members.$inferSelect;
export type MembershipFee = typeof membershipFees.$inferSelect;
export type CourseEnrollmentRow = typeof courseEnrollments.$inferSelect;
