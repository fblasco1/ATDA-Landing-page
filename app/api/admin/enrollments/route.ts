import { requireAdminApi } from "@/lib/admin/session";
import { isActiveMember } from "@/lib/courses/member-check";
import { parseBuyer } from "@/lib/enrollments/buyer";
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
    const parsed = parseBuyer({
      name: text("name"),
      email: text("email"),
      dni: text("dni"),
      phone: text("phone"),
    });
    const amount = Number(body.amount ?? 0);
    const status = text("status") === "paid" ? "paid" : "pending";

    if (!courseId) {
      return Response.json({ error: "Elegí una propuesta." }, { status: 400 });
    }
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
    if (!Number.isFinite(amount) || amount < 0) {
      return Response.json({ error: "Importe inválido." }, { status: 400 });
    }

    const course = await getCourseById(courseId);
    if (!course) return Response.json({ error: "Propuesta no encontrada." }, { status: 404 });

    const isMember = await isActiveMember(parsed.buyer.email, parsed.buyer.dni);
    const created = await createEnrollment({
      course: { _type: "reference", _ref: course._id },
      buyer: { ...parsed.buyer, isMember },
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
