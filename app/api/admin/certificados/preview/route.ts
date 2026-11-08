import { requireAdminApi } from "@/lib/admin/session";
import { buildCertificate, certificateFieldsFromBody } from "@/lib/email/certificate-mail";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { error } = await requireAdminApi();
    if (error) return error;

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ success: false, error: "No se pudo leer la vista previa." }, { status: 400 });
    }

    const built = await buildCertificate({
      ...certificateFieldsFromBody(body),
      nombre: String(body.nombre ?? "Cuassolo Canalis, Leandro"),
      correo: "ejemplo@atda.org.ar",
    });
    if (!built.ok) return Response.json({ success: false, error: built.error }, { status: built.status });

    return new Response(new Blob([built.pdf], { type: "application/pdf" }), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${built.filename}"`,
      },
    });
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "No se pudo generar el certificado." },
      { status: 500 },
    );
  }
}
