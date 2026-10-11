import { isActiveMember } from "@/lib/courses/member-check";
import { coursePriceFor, isFreeCourse } from "@/lib/courses/pricing";
import { isModoCheckoutEnabled } from "@/lib/payments/flags";
import { createModoPaymentRequest } from "@/lib/payments/modo";
import { getCourseById } from "@/lib/sanity/fetch";
import { createEnrollment, patchDocument } from "@/lib/sanity/write";

export async function POST(request: Request) {
  if (!isModoCheckoutEnabled()) {
    return Response.json({ error: "Las inscripciones online todavía no están habilitadas" }, { status: 503 });
  }
  try {
    const body = (await request.json()) as {
      courseId?: string;
      name?: string;
      email?: string;
      dni?: string;
      phone?: string;
      termsAccepted?: boolean;
    };
    if (!body.courseId || !body.name || !body.email || !body.dni || !body.phone) {
      return Response.json({ error: "Completá todos los datos" }, { status: 400 });
    }
    if (body.termsAccepted !== true) {
      return Response.json({ error: "Tenés que aceptar los términos y condiciones" }, { status: 400 });
    }

    const course = await getCourseById(body.courseId);
    if (!course || !course.active) {
      return Response.json({ error: "El curso no está disponible" }, { status: 404 });
    }
    if (isFreeCourse(course)) {
      return Response.json({ error: "Esta actividad no es arancelada" }, { status: 400 });
    }

    const isMember = await isActiveMember(body.email, body.dni);
    const amount = coursePriceFor(course, isMember);
    if (amount <= 0) {
      return Response.json({ error: "El curso no tiene precio configurado" }, { status: 409 });
    }

    const enrollment = await createEnrollment({
      course: { _type: "reference", _ref: course._id },
      buyer: { name: body.name, email: body.email, dni: body.dni, phone: body.phone, isMember },
      amount,
      provider: "modo",
      status: "pending",
    });

    const payment = await createModoPaymentRequest({
      enrollmentId: enrollment._id,
      amount,
      description: `Curso ATDA: ${course.title}`,
      customer: {
        full_name: body.name,
        email: body.email,
        identification: body.dni,
        phone: body.phone,
      },
    });

    await patchDocument(enrollment._id, {
      providerPaymentId: payment.id,
      modoQr: payment.qr,
      modoDeeplink: payment.deeplink,
      modoExpiresAt: payment.expirationDate,
    });

    return Response.json({ enrollmentId: enrollment._id });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Error al crear el pago MODO" },
      { status: 500 },
    );
  }
}
