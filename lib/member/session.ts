import { auth } from "@/auth";
import { getMemberById } from "@/lib/db/members";

export async function getMemberSession() {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "member" || !session.user.memberId) {
    return null;
  }
  return session;
}

export async function requireMemberApi() {
  const session = await getMemberSession();
  if (!session) {
    return { session: null, member: null, error: Response.json({ error: "No autorizado" }, { status: 401 }) };
  }
  const member = await getMemberById(session.user.memberId!);
  if (!member || member.status !== "active") {
    return {
      session: null,
      member: null,
      error: Response.json({ error: "Socio no disponible" }, { status: 403 }),
    };
  }
  return { session, member, error: null };
}
