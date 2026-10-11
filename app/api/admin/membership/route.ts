import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/session";
import {
  approveMembershipRequest,
  isDatabaseConfigured,
  listMembershipRequests,
  updateMembershipRequestStatus,
} from "@/lib/db/members";
import type { MembershipRequest } from "@/lib/db/schema";
import { sendMemberActivationEmail } from "@/lib/email/members";

export async function GET(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL no configurada", items: [] }, { status: 503 });
  }
  const status = new URL(request.url).searchParams.get("status") as MembershipRequest["status"] | null;
  try {
    const items = await listMembershipRequests(status || undefined);
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error", items: [] },
      { status: 500 },
    );
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
      id?: number;
      status?: MembershipRequest["status"];
      adminNotes?: string;
    };
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id y status requeridos" }, { status: 400 });
    }

    if (body.status === "approved") {
      const { request: approvedRequest, member } = await approveMembershipRequest(body.id, body.adminNotes);
      const needsActivation = member.status === "active" && !member.passwordHash;
      const email = needsActivation
        ? await sendMemberActivationEmail(member, {
            request,
            idempotencyKey: `activation-request-${body.id}-${member.email}`,
          })
        : null;
      return NextResponse.json({
        ok: true,
        request: approvedRequest,
        memberId: member.id,
        emailSent: email?.ok ?? false,
        emailError: email && !email.ok ? email.error : undefined,
      });
    }

    const allowed: MembershipRequest["status"][] = ["received", "reviewing", "rejected"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const row = await updateMembershipRequestStatus(body.id, body.status, body.adminNotes);
    return NextResponse.json({ ok: true, request: row });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
