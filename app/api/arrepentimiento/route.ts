import { after, NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { createWithdrawalRequest } from "@/lib/db/withdrawals";
import { sendWithdrawalEmails } from "@/lib/email/withdrawals";
import { privacyContactEmail } from "@/lib/legal/privacy";
import { getLandingContent } from "@/lib/sanity/fetch";

function clean(value: unknown, max = 255) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "No pudimos registrar el pedido. Escribinos por el formulario de contacto." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (clean(body.website)) return NextResponse.json({ ok: true, code: "" });

    const fullName = clean(body.fullName, 200);
    const email = clean(body.email).toLowerCase();
    const dni = clean(body.dni, 32);
    const purchase = clean(body.purchase);
    const details = clean(body.details, 2000);

    if (!fullName || !email || !dni || !purchase) {
      return NextResponse.json({ error: "Completá los campos obligatorios." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const row = await createWithdrawalRequest({ fullName, email, dni, purchase, details });

    after(async () => {
      const { settings } = await getLandingContent();
      const fallback = privacyContactEmail(settings);
      await sendWithdrawalEmails(row, fallback ? [fallback] : [], request);
    });

    return NextResponse.json({ ok: true, code: row.code });
  } catch (error) {
    console.error("withdrawal request", error);
    return NextResponse.json({ error: "No se pudo registrar el pedido. Intentá de nuevo." }, { status: 500 });
  }
}
