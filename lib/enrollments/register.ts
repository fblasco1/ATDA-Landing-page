import { isActiveMember } from "@/lib/courses/member-check";
import { coursePriceFor, isFreeCourse } from "@/lib/courses/pricing";
import { isModoCheckoutEnabled } from "@/lib/payments/flags";
import { getCourseById } from "@/lib/sanity/fetch";
import { createEnrollment } from "@/lib/sanity/write";
import { parseBuyer } from "./buyer";

export async function registerPublicEnrollment(body: {
  courseId?: string;
  name?: string;
  email?: string;
  dni?: string;
  phone?: string;
  website?: string;
  termsAccepted?: boolean;
}) {
  if (body.website?.trim()) return { ok: true as const, ignored: true as const };

  const parsed = parseBuyer(body);
  if (!parsed.ok) return { ok: false as const, status: 400, error: parsed.error };
  if (body.termsAccepted !== true) {
    return { ok: false as const, status: 400, error: "Tenés que aceptar los términos y condiciones." };
  }
  if (!body.courseId) return { ok: false as const, status: 400, error: "Completá todos los datos." };

  const course = await getCourseById(body.courseId);
  if (!course || !course.active) {
    return { ok: false as const, status: 404, error: "La actividad no está disponible." };
  }

  const isMember = await isActiveMember(parsed.buyer.email, parsed.buyer.dni);
  const buyer = { ...parsed.buyer, isMember };

  if (isFreeCourse(course)) {
    const enrollment = await createEnrollment({
      course: { _type: "reference", _ref: course._id },
      buyer,
      amount: 0,
      provider: "free",
      status: "paid",
    });
    return { ok: true as const, enrollmentId: enrollment._id, pendingPayment: false };
  }

  if (isModoCheckoutEnabled()) {
    return { ok: false as const, status: 400, error: "Esta actividad se abona con el pago online." };
  }

  const enrollment = await createEnrollment({
    course: { _type: "reference", _ref: course._id },
    buyer,
    amount: coursePriceFor(course, isMember),
    provider: "manual",
    status: "pending",
  });
  return { ok: true as const, enrollmentId: enrollment._id, pendingPayment: true };
}
