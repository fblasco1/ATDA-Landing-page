import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  isDatabaseConfigured,
  updateMember,
  verifyMemberIdentity,
} from "@/lib/db/members";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

async function setPassword(body: Record<string, unknown>, mode: "activate" | "recover") {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  }

  const email = clean(body.email).toLowerCase();
  const dni = clean(body.dni);
  const password = clean(body.password);
  const confirm = clean(body.confirmPassword);

  if (!email || !dni || !password) {
    return NextResponse.json({ error: "Completá email, DNI y contraseña." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }
  if (password !== confirm) {
    return NextResponse.json({ error: "Las contraseñas no coinciden." }, { status: 400 });
  }

  const member = await verifyMemberIdentity(email, dni);
  if (!member) {
    return NextResponse.json(
      { error: "No encontramos un socio activo con esos datos." },
      { status: 404 },
    );
  }
  if (member.status !== "active") {
    return NextResponse.json({ error: "Tu membresía no está activa." }, { status: 403 });
  }
  if (mode === "activate" && member.passwordHash) {
    return NextResponse.json(
      { error: "El acceso ya está activado. Usá Recuperar acceso si olvidaste la contraseña." },
      { status: 409 },
    );
  }
  if (mode === "recover" && !member.passwordHash) {
    return NextResponse.json(
      { error: "Todavía no activaste el acceso. Usá Activar acceso." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await updateMember(member.id, { passwordHash });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    return setPassword(body, "activate");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 500 },
    );
  }
}
