import { requireAdminApi } from "@/lib/admin/session";
import { certificateFieldsFromBody, sendCertificateEmail } from "@/lib/email/certificate-mail";
import { isEmailConfigured } from "@/lib/email/send";

export const maxDuration = 60;

function fail(error: string, status = 400) {
  return Response.json({ success: false, error }, { status });
}

async function readInput(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return { error: "El JSON del envío no se pudo leer." } as const;
  }
  return { input: certificateFieldsFromBody(body) };
}

export async function GET() {
  try {
    const { error } = await requireAdminApi();
    if (error) return error;
    return Response.json({
      configured: isEmailConfigured(),
      from: process.env.EMAIL_FROM?.trim() || null,
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "No se pudo leer la configuración de correo.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdminApi();
    if (error) return error;

    const payload = await readInput(request);
    if ("error" in payload) return fail(payload.error);

    const result = await sendCertificateEmail(payload.input);
    if (!result.success) return fail(result.error, result.status);
    return Response.json({ success: true });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Error inesperado al enviar el certificado.", 500);
  }
}
