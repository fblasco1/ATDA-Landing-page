import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/session";
import { getMemberById, isDatabaseConfigured } from "@/lib/db/members";
import { sendMemberActivationEmail } from "@/lib/email/members";

type Context = { params: Promise<{ id: string }> };

/** Reenvía el mail de activación (por ejemplo, si el socio no lo recibió). */
export async function POST(request: Request, context: Context) {
  const { error } = await requireAdminApi();
  if (error) return error;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  }
  const id = Number((await context.params).id);
  const member = Number.isInteger(id) ? await getMemberById(id) : null;
  if (!member) return NextResponse.json({ error: "Socio no encontrado" }, { status: 404 });
  if (member.passwordHash) {
    return NextResponse.json({ error: "Este socio ya activó su acceso." }, { status: 409 });
  }
  if (member.status !== "active") {
    return NextResponse.json({ error: "El socio no está activo: no podría activar el acceso." }, { status: 409 });
  }

  const result = await sendMemberActivationEmail(member, { request });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true });
}
