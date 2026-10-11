import { after, NextResponse } from "next/server";
import { notifyNewMembershipRequest } from "@/lib/email/members";
import {
  createMembershipRequest,
  findOpenRequestByEmail,
  isDatabaseConfigured,
} from "@/lib/db/members";

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "La base de datos de socios aún no está configurada. Pedí a un admin que configure DATABASE_URL (Neon).",
      },
      { status: 503 },
    );
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? ((await request.json()) as Record<string, unknown>)
      : Object.fromEntries((await request.formData()).entries());

    // Honeypot anti-spam
    if (clean(body.website as FormDataEntryValue) || clean(body.companyUrl as FormDataEntryValue)) {
      return NextResponse.json({ ok: true });
    }

    const fullName = clean(body.fullName as FormDataEntryValue);
    const email = clean(body.email as FormDataEntryValue).toLowerCase();
    const dni = clean(body.dni as FormDataEntryValue);
    const phone = clean(body.phone as FormDataEntryValue);
    const profession = clean(body.profession as FormDataEntryValue);
    const organization = clean(body.organization as FormDataEntryValue);
    const roleTitle = clean(body.roleTitle as FormDataEntryValue);
    const motivation = clean(body.motivation as FormDataEntryValue);

    if (!fullName || !email || !dni || !phone || !profession) {
      return NextResponse.json({ error: "Completá los campos obligatorios." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }
    const privacyAccepted = body.privacyAccepted === true || body.privacyAccepted === "on";
    if (!privacyAccepted) {
      return NextResponse.json(
        { error: "Para enviar la solicitud tenés que aceptar la política de privacidad." },
        { status: 400 },
      );
    }

    const existing = await findOpenRequestByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Ya hay una solicitud pendiente con este email." },
        { status: 409 },
      );
    }

    const row = await createMembershipRequest({
      fullName,
      email,
      dni,
      phone,
      profession,
      organization: organization || undefined,
      roleTitle: roleTitle || undefined,
      motivation: motivation || undefined,
      privacyAcceptedAt: new Date(),
    });

    after(() =>
      notifyNewMembershipRequest(
        { id: row.id, fullName, email, profession, organization: organization || undefined },
        request,
      ),
    );

    return NextResponse.json({ ok: true, id: row.id });
  } catch (error) {
    console.error("membership request", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar la solicitud" },
      { status: 500 },
    );
  }
}
