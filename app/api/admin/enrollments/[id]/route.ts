import { requireAdminApi } from "@/lib/admin/session";
import { classroomWelcomeEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { classroomUrlError } from "@/lib/enrollments/classroom";
import { getEnrollmentByIdFresh } from "@/lib/sanity/fetch";
import { patchDocument } from "@/lib/sanity/write";

type Context = { params: Promise<{ id: string }> };

function urlKey(value: string) {
  let hash = 0;
  for (const char of value) hash = (Math.imul(31, hash) + char.charCodeAt(0)) >>> 0;
  return hash.toString(36);
}

export async function PATCH(request: Request, context: Context) {
  const { error } = await requireAdminApi();
  if (error) return error;
  const { id } = await context.params;
  try {
    const data = (await request.json()) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};

    if (data.status === "paid" || data.status === "pending") {
      patch.status = data.status;
    }

    const granting = data.classroomAccess === "granted";
    if (granting) {
      const classroomUrl = String(data.classroomUrl ?? "").trim();
      const urlError = classroomUrlError(classroomUrl);
      if (urlError) return Response.json({ error: urlError }, { status: 400 });
      patch.classroomAccess = "granted";
      patch.classroomUrl = classroomUrl;
      patch.notes = String(data.notes ?? "").trim();
    }

    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "No hay cambios para guardar." }, { status: 400 });
    }

    await patchDocument(id, patch);
    const item = await getEnrollmentByIdFresh(id);

    if (!granting) return Response.json({ item, emailSent: false });

    const to = item?.buyer?.email?.trim();
    const classroomUrl = String(patch.classroomUrl);
    if (!to) {
      return Response.json({
        item,
        emailSent: false,
        emailError: "La inscripción no tiene email, así que no se envió el mail.",
      });
    }

    const email = classroomWelcomeEmail({
      fullName: item?.buyer?.name?.trim() || "Hola",
      courseTitle: item?.course?.title?.trim() || "tu curso",
      classroomUrl,
    });
    const result = await sendEmail({
      to,
      ...email,
      idempotencyKey: `classroom-${id}-${urlKey(classroomUrl)}`,
    });
    return Response.json({
      item,
      emailSent: result.ok,
      emailError: result.ok ? undefined : result.error,
    });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
