import bcrypt from "bcryptjs";
import { requireAdminApi } from "@/lib/admin/session";
import { getAdminUserById, setAdminPassword } from "@/lib/db/admins";

export async function POST(request: Request) {
  const { session, error } = await requireAdminApi({ allowPendingPasswordChange: true });
  if (error) return error;

  const adminUserId = session.user.adminUserId;
  if (!adminUserId) {
    return Response.json(
      { error: "Las cuentas de Google no tienen contraseña en ATDA" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (newPassword.length < 10) {
    return Response.json({ error: "La contraseña nueva debe tener al menos 10 caracteres." }, { status: 400 });
  }
  if (newPassword !== String(body.confirmPassword ?? "")) {
    return Response.json({ error: "Las contraseñas no coinciden." }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return Response.json({ error: "La contraseña nueva tiene que ser distinta de la actual." }, { status: 400 });
  }

  const admin = await getAdminUserById(adminUserId);
  if (!admin) return Response.json({ error: "Usuario no encontrado" }, { status: 404 });

  const ok = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!ok) return Response.json({ error: "La contraseña actual no es correcta." }, { status: 400 });

  await setAdminPassword(admin.id, await bcrypt.hash(newPassword, 12));
  return Response.json({ ok: true });
}
