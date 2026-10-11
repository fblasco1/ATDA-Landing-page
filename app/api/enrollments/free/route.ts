import { isActiveMember } from "@/lib/courses/member-check";
import { isFreeCourse } from "@/lib/courses/pricing";
import { getCourseById } from "@/lib/sanity/fetch";
import { createEnrollment } from "@/lib/sanity/write";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      courseId?: string;
      name?: string;
      email?: string;
      dni?: string;
      phone?: string;
      website?: string;
    };
    if (body.website?.trim()) {
      return Response.json({ ok: true });
    }

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const dni = body.dni?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    if (!body.courseId || !name || !email || !dni || !phone) {
      return Response.json({ error: "Completá todos los datos" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Email inválido" }, { status: 400 });
    }

    const course = await getCourseById(body.courseId);
    if (!course || !course.active || !isFreeCourse(course)) {
      return Response.json({ error: "La actividad no está disponible" }, { status: 404 });
    }

    const isMember = await isActiveMember(email, dni);
    const enrollment = await createEnrollment({
      course: { _type: "reference", _ref: course._id },
      buyer: { name, email, dni, phone, isMember },
      amount: 0,
      provider: "free",
      status: "paid",
    });

    return Response.json({ enrollmentId: enrollment._id });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "No se pudo registrar la inscripción" },
      { status: 500 },
    );
  }
}
