import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/session";
import {
  createMember,
  createMembershipFee,
  getMemberById,
  isDatabaseConfigured,
  listFeesForMember,
  listMembersWithLatestFee,
  updateMember,
  updateMembershipFee,
} from "@/lib/db/members";
import type { Member, MembershipFee } from "@/lib/db/schema";
import { sendMemberActivationEmail } from "@/lib/email/members";

export async function GET(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL no configurada", items: [] }, { status: 503 });
  }

  const url = new URL(request.url);
  const memberId = url.searchParams.get("id");
  try {
    if (memberId) {
      const member = await getMemberById(Number(memberId));
      if (!member) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      const fees = await listFeesForMember(member.id);
      return NextResponse.json({ member, fees });
    }
    const items = await listMembersWithLatestFee();
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error", items: [] },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const text = (key: string) => String(body[key] ?? "").trim();
    const fullName = text("fullName");
    const email = text("email").toLowerCase();
    const dni = text("dni");
    const status = text("status") as Member["status"];

    if (!fullName || !email || !dni) {
      return NextResponse.json({ error: "Nombre, email y DNI son obligatorios." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const { passwordHash: _hash, ...member } = await createMember({
      fullName,
      email,
      dni,
      phone: text("phone"),
      profession: text("profession"),
      organization: text("organization"),
      roleTitle: text("roleTitle"),
      status: ["active", "suspended", "inactive"].includes(status) ? status : "active",
      notes: text("notes"),
    });
    const activation =
      member.status === "active"
        ? await sendMemberActivationEmail(member, { request, idempotencyKey: `activation-member-${member.id}-${member.email}` })
        : null;
    return NextResponse.json({
      member,
      emailSent: activation?.ok ?? false,
      emailError: activation && !activation.ok ? activation.error : undefined,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      memberId?: number;
      status?: Member["status"];
      notes?: string;
      feeId?: number;
      feeStatus?: MembershipFee["status"];
      amountCents?: number;
      createFee?: { period: string; amountCents: number; notes?: string };
    };

    if (body.createFee && body.memberId) {
      const fee = await createMembershipFee({
        memberId: body.memberId,
        period: body.createFee.period,
        amountCents: body.createFee.amountCents,
        notes: body.createFee.notes,
      });
      return NextResponse.json({ ok: true, fee });
    }

    if (body.feeId && body.feeStatus) {
      const paidAt = body.feeStatus === "paid" ? new Date() : null;
      const fee = await updateMembershipFee(body.feeId, {
        status: body.feeStatus,
        paidAt,
        amountCents: body.amountCents,
      });
      return NextResponse.json({ ok: true, fee });
    }

    if (body.memberId && body.status) {
      const member = await updateMember(body.memberId, {
        status: body.status,
        notes: body.notes,
      });
      return NextResponse.json({ ok: true, member });
    }

    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
