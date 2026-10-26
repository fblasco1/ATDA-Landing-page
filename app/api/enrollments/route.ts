import { registerPublicEnrollment } from "@/lib/enrollments/register";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      courseId?: string;
      name?: string;
      email?: string;
      dni?: string;
      phone?: string;
      website?: string;
      termsAccepted?: boolean;
    };
    const result = await registerPublicEnrollment(body);
    if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
    if ("ignored" in result) return Response.json({ ok: true });
    return Response.json({ enrollmentId: result.enrollmentId, pendingPayment: result.pendingPayment });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "No se pudo registrar la inscripción" },
      { status: 500 },
    );
  }
}
