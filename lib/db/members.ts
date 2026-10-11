import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "./index";
import {
  members,
  membershipFees,
  membershipRequests,
  type Member,
  type MembershipFee,
  type MembershipRequest,
} from "./schema";

export { isDatabaseConfigured };

export async function createMembershipRequest(input: {
  fullName: string;
  email: string;
  dni: string;
  phone: string;
  profession: string;
  organization?: string;
  roleTitle?: string;
  motivation?: string;
  privacyAcceptedAt: Date;
}) {
  const db = getDb();
  const [row] = await db
    .insert(membershipRequests)
    .values({
      privacyAcceptedAt: input.privacyAcceptedAt,
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      dni: input.dni,
      phone: input.phone,
      profession: input.profession,
      organization: input.organization || null,
      roleTitle: input.roleTitle || null,
      motivation: input.motivation || null,
      status: "received",
    })
    .returning();
  return row;
}

export async function listMembershipRequests(status?: MembershipRequest["status"]) {
  const db = getDb();
  if (status) {
    return db
      .select()
      .from(membershipRequests)
      .where(eq(membershipRequests.status, status))
      .orderBy(desc(membershipRequests.createdAt));
  }
  return db.select().from(membershipRequests).orderBy(desc(membershipRequests.createdAt));
}

export async function getMembershipRequest(id: number) {
  const db = getDb();
  const [row] = await db.select().from(membershipRequests).where(eq(membershipRequests.id, id)).limit(1);
  return row ?? null;
}

export async function updateMembershipRequestStatus(
  id: number,
  status: MembershipRequest["status"],
  adminNotes?: string,
) {
  const db = getDb();
  const [row] = await db
    .update(membershipRequests)
    .set({
      status,
      adminNotes: adminNotes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(membershipRequests.id, id))
    .returning();
  return row ?? null;
}

/** Aprueba solicitud y crea socio si no existe por email. */
export async function approveMembershipRequest(id: number, adminNotes?: string) {
  const db = getDb();
  const request = await getMembershipRequest(id);
  if (!request) throw new Error("Solicitud no encontrada");
  if (request.status === "approved") throw new Error("La solicitud ya fue aprobada");

  const existing = await db
    .select()
    .from(members)
    .where(eq(members.email, request.email.toLowerCase()))
    .limit(1);

  let member = existing[0];
  if (!member) {
    const [created] = await db
      .insert(members)
      .values({
        email: request.email.toLowerCase(),
        fullName: request.fullName,
        dni: request.dni,
        phone: request.phone,
        profession: request.profession,
        organization: request.organization,
        roleTitle: request.roleTitle,
        status: "active",
        membershipRequestId: request.id,
        notes: adminNotes || null,
      })
      .returning();
    member = created;

    const defaultCents = Number(process.env.MEMBERSHIP_FEE_CENTS ?? "0") || 0;
    const period = new Date().toISOString().slice(0, 7);
    await db.insert(membershipFees).values({
      memberId: member.id,
      period,
      amountCents: defaultCents,
      status: "pending",
      notes: defaultCents ? null : "Cuota inicial — monto a definir",
    });
  }

  const updated = await updateMembershipRequestStatus(id, "approved", adminNotes);
  return { request: updated, member };
}

/** Alta manual desde el panel, sin solicitud previa. */
export async function createMember(input: {
  fullName: string;
  email: string;
  dni: string;
  phone?: string;
  profession?: string;
  organization?: string;
  roleTitle?: string;
  status?: Member["status"];
  notes?: string;
}) {
  const db = getDb();
  const email = input.email.toLowerCase();
  const [duplicate] = await db
    .select({ email: members.email, dni: members.dni })
    .from(members)
    .where(or(eq(members.email, email), eq(members.dni, input.dni)))
    .limit(1);
  if (duplicate) {
    throw new Error(
      duplicate.email === email ? "Ya existe un socio con ese email." : "Ya existe un socio con ese DNI.",
    );
  }

  const [row] = await db
    .insert(members)
    .values({
      email,
      fullName: input.fullName,
      dni: input.dni,
      phone: input.phone || null,
      profession: input.profession || null,
      organization: input.organization || null,
      roleTitle: input.roleTitle || null,
      status: input.status ?? "active",
      notes: input.notes || null,
    })
    .returning();
  return row;
}

export async function listMembers(filters?: {
  status?: Member["status"];
  q?: string;
}) {
  const db = getDb();
  const conditions = [];
  if (filters?.status) conditions.push(eq(members.status, filters.status));
  if (filters?.q?.trim()) {
    const q = `%${filters.q.trim()}%`;
    conditions.push(
      or(ilike(members.fullName, q), ilike(members.email, q), ilike(members.dni, q))!,
    );
  }
  const query = db.select().from(members).orderBy(desc(members.createdAt));
  if (conditions.length === 0) return query;
  return db
    .select()
    .from(members)
    .where(conditions.length === 1 ? conditions[0] : and(...conditions))
    .orderBy(desc(members.createdAt));
}

export async function getMemberById(id: number) {
  const db = getDb();
  const [row] = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return row ?? null;
}

export async function getMemberByEmail(email: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(members)
    .where(eq(members.email, email.toLowerCase()))
    .limit(1);
  return row ?? null;
}

export async function updateMember(
  id: number,
  patch: Partial<{
    fullName: string;
    phone: string | null;
    profession: string | null;
    organization: string | null;
    roleTitle: string | null;
    status: Member["status"];
    notes: string | null;
    passwordHash: string | null;
  }>,
) {
  const db = getDb();
  const [row] = await db
    .update(members)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(members.id, id))
    .returning();
  return row ?? null;
}

export async function listFeesForMember(memberId: number) {
  const db = getDb();
  return db
    .select()
    .from(membershipFees)
    .where(eq(membershipFees.memberId, memberId))
    .orderBy(desc(membershipFees.period));
}

export async function getFeeById(id: number) {
  const db = getDb();
  const [row] = await db.select().from(membershipFees).where(eq(membershipFees.id, id)).limit(1);
  return row ?? null;
}

export async function createMembershipFee(input: {
  memberId: number;
  period: string;
  amountCents: number;
  notes?: string;
}) {
  const db = getDb();
  const [row] = await db
    .insert(membershipFees)
    .values({
      memberId: input.memberId,
      period: input.period,
      amountCents: input.amountCents,
      status: "pending",
      notes: input.notes || null,
    })
    .returning();
  return row;
}

export async function updateMembershipFee(
  id: number,
  patch: Partial<{
    amountCents: number;
    status: MembershipFee["status"];
    paidAt: Date | null;
    notes: string | null;
  }>,
) {
  const db = getDb();
  const [row] = await db
    .update(membershipFees)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(membershipFees.id, id))
    .returning();
  return row ?? null;
}

export async function findOpenRequestByEmail(email: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(membershipRequests)
    .where(eq(membershipRequests.email, email.toLowerCase()))
    .orderBy(desc(membershipRequests.createdAt))
    .limit(5);
  return rows.find((row) => row.status === "received" || row.status === "reviewing") ?? null;
}

export async function listMembersWithLatestFee() {
  const db = getDb();
  const allMembers = await listMembers();
  const result = [];
  for (const member of allMembers) {
    const { passwordHash: _hash, ...safe } = member;
    const fees = await listFeesForMember(member.id);
    result.push({ member: safe as Member, latestFee: fees[0] ?? null, feesCount: fees.length });
  }
  return result;
}

export function normalizeDni(value: string) {
  return value.replace(/\D/g, "");
}

export async function verifyMemberIdentity(email: string, dni: string) {
  const member = await getMemberByEmail(email);
  if (!member) return null;
  if (normalizeDni(member.dni) !== normalizeDni(dni)) return null;
  return member;
}

export async function countMembersByStatus() {
  const db = getDb();
  const rows = await db
    .select({
      status: members.status,
      count: sql<number>`count(*)::int`,
    })
    .from(members)
    .groupBy(members.status);
  return rows;
}
