import { isModoCheckoutEnabled } from "@/lib/payments/flags";
import { getModoPaymentRequest, mapModoStatus } from "@/lib/payments/modo";
import { getEnrollmentByIdFresh } from "@/lib/sanity/fetch";
import { patchDocument } from "@/lib/sanity/write";

type ModoWebhookPayload = {
  id?: string;
  payment_request_id?: string;
  paymentRequestId?: string;
  external_intention_id?: string;
  externalIntentionId?: string;
  status?: string;
  payment_status?: string;
  state?: string;
  message?: string;
};

export async function POST(request: Request) {
  if (!isModoCheckoutEnabled()) {
    return Response.json({ error: "Checkout MODO deshabilitado" }, { status: 503 });
  }
  try {
    const payload = (await request.json()) as ModoWebhookPayload;
    const paymentRequestId =
      payload.payment_request_id ?? payload.paymentRequestId ?? payload.id;
    const enrollmentId =
      payload.external_intention_id ?? payload.externalIntentionId ?? payload.message;

    if (!enrollmentId && !paymentRequestId) {
      return Response.json({ ok: true });
    }

    let resolvedEnrollmentId = enrollmentId;
    let statusHint = payload.status ?? payload.payment_status ?? payload.state;

    if (paymentRequestId) {
      try {
        const remote = await getModoPaymentRequest(paymentRequestId);
        statusHint = remote.status ?? remote.payment_status ?? remote.state ?? statusHint;
        if (!resolvedEnrollmentId) {
          // Si el webhook no trae external id, no podemos mapear sin lookup local.
        }
      } catch (err) {
        console.error("MODO webhook lookup", err);
      }
    }

    if (!resolvedEnrollmentId) {
      return Response.json({ ok: true });
    }

    const enrollment = await getEnrollmentByIdFresh(resolvedEnrollmentId);
    if (!enrollment) {
      return Response.json({ ok: true });
    }

    const nextStatus = mapModoStatus(statusHint);
    if (enrollment.status === "paid" && nextStatus === "paid") {
      return Response.json({ ok: true });
    }

    await patchDocument(resolvedEnrollmentId, {
      status: nextStatus,
      ...(paymentRequestId ? { providerPaymentId: paymentRequestId } : {}),
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Webhook MODO", err);
    return Response.json({ error: "Error interno" }, { status: 500 });
  }
}
