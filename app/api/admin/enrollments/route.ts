import { requireAdminApi } from "@/lib/admin/session";
import { isActiveMember } from "@/lib/courses/member-check";
import { getCourseById, getEnrollmentByIdFresh } from "@/lib/sanity/fetch";
import { createEnrollment } from "@/lib/sanity/write";

/** Alta manual de una inscripción (pago por fuera de la web, históricos, etc.). */
export async function POST(request: Request) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const text = (key: string) => String(body[key] ?? "").trim();
    const courseId = text("courseId");
    const name = text("name");
    const email = text("email").toLowerCase();
    const dni = text("dni");
    const phone = text("phone");
    const amount = Number(body.amount ?? 0);
    const status = text("status") === "paid" ? "paid" : "pending";

    if (!courseId || !name || !email || !dni) {
      return Response.json({ error: "Propuesta, nombre, email y DNI son obligatorios." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return Response.json({ error: "Importe inválido." }, { status: 400 });
    }

    const course = await getCourseById(courseId);
    if (!course) return Response.json({ error: "Propuesta no encontrada." }, { status: 404 });

    const isMember = await isActiveMember(email, dni);
    const created = await createEnrollment({
      course: { _type: "reference", _ref: course._id },
      buyer: { name, email, dni, phone, isMember },
      amount,
      provider: "manual",
      status,
      notes: text("notes") || undefined,
    });
    const enrollment = await getEnrollmentByIdFresh(created._id);
    return Response.json({ enrollment });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
