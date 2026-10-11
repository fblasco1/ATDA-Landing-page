import { Resend } from "resend";

export type EmailResult = { ok: true; id?: string } | { ok: false; error: string };

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

let client: Resend | null = null;

function getClient() {
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

/** Nunca lanza: el que llama decide qué hacer si el mail no sale. */
export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Resend descarta un envío repetido con la misma clave durante 24 h. */
  idempotencyKey?: string;
}): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "El envío de mails no está configurado (RESEND_API_KEY / EMAIL_FROM)." };
  }
  try {
    const { data, error } = await getClient().emails.send(
      {
        from: process.env.EMAIL_FROM!.trim(),
        to: input.to,
        replyTo: process.env.EMAIL_REPLY_TO?.trim() || undefined,
        subject: input.subject,
        html: input.html,
        text: input.text,
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    );
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error al enviar el mail" };
  }
}

/** URL pública del sitio para armar links en los mails. */
export function siteUrl(request?: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return request ? new URL(request.url).origin : "https://atda.org.ar";
}
