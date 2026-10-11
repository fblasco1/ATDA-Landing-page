import { isDatabaseConfigured, verifyMemberIdentity } from "@/lib/db/members";

/** Socio con email y DNI registrados y membresía activa. Sin base configurada, nadie es socio. */
export async function isActiveMember(email: string, dni: string) {
  if (!isDatabaseConfigured()) return false;
  try {
    const member = await verifyMemberIdentity(email.trim().toLowerCase(), dni);
    return member?.status === "active";
  } catch (error) {
    console.error("member check", error);
    return false;
  }
}
