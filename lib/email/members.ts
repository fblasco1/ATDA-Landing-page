import type { Member } from "@/lib/db/schema";
import { sendEmail, siteUrl, type EmailResult } from "./send";
import { memberActivationEmail, newMembershipRequestEmail } from "./templates";

export async function sendMemberActivationEmail(
  member: Pick<Member, "id" | "email" | "fullName">,
  { request, idempotencyKey }: { request?: Request; idempotencyKey?: string } = {},
): Promise<EmailResult> {
  const email = memberActivationEmail({
    fullName: member.fullName,
    email: member.email,
    baseUrl: siteUrl(request),
  });
  return sendEmail({ to: member.email, ...email, idempotencyKey });
}

/** Destinatarios del aviso de nuevas solicitudes, separados por coma en MEMBERSHIP_NOTIFY_EMAILS. */
function notifyRecipients() {
  return (process.env.MEMBERSHIP_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function notifyNewMembershipRequest(
  input: { id: number; fullName: string; email: string; profession: string; organization?: string },
  request?: Request,
) {
  const to = notifyRecipients();
  if (to.length === 0) return;
  const email = newMembershipRequestEmail({ ...input, baseUrl: siteUrl(request) });
  const result = await sendEmail({ to, ...email, idempotencyKey: `membership-request-${input.id}` });
  if (!result.ok) console.error("No se pudo avisar la nueva solicitud", result.error);
}
