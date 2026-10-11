import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/utils";

/** Sesión admin (Google en ADMIN_EMAILS o usuario de admin_users). */
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user?.email) return null;
  if (session.user.role === "admin") return session;
  if (!session.user.role && isAdminEmail(session.user.email)) return session;
  return null;
}

export async function requireAdminApi({ allowPendingPasswordChange = false } = {}) {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, error: Response.json({ error: "No autorizado" }, { status: 401 }) };
  }
  if (session.user.mustChangePassword && !allowPendingPasswordChange) {
    return {
      session: null,
      error: Response.json({ error: "Tenés que cambiar la contraseña" }, { status: 403 }),
    };
  }
  return { session, error: null };
}
