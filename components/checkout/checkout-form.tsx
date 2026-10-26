"use client";

import Link from "next/link";
import { useState } from "react";
import { isFreeCourse, priceModeOf } from "@/lib/courses/pricing";
import { parseBuyer } from "@/lib/enrollments/buyer";
import { formatARS } from "@/lib/utils";
import type { Course } from "@/lib/sanity/types";
import { buttonClass } from "@/components/ui/button";

export function CheckoutForm({ course, paymentEnabled }: { course: Course; paymentEnabled: boolean }) {
  const free = isFreeCourse(course);
  const payOnline = !free && paymentEnabled;
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "done">("idle");
  const [pendingPayment, setPendingPayment] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      courseId: course._id,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      dni: String(form.get("dni") ?? ""),
      phone: String(form.get("phone") ?? ""),
      website: String(form.get("website") ?? ""),
      termsAccepted: form.get("termsAccepted") === "on",
    };
    const parsed = parseBuyer(payload);
    if (!parsed.ok) {
      setStatus("error");
      setError(parsed.error);
      return;
    }
    if (!payload.termsAccepted) {
      setStatus("error");
      setError("Tenés que aceptar los términos y condiciones.");
      return;
    }

    try {
      const response = await fetch(payOnline ? "/api/checkout/modo" : "/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ...parsed.buyer }),
      });
      const data = (await response.json()) as {
        error?: string;
        enrollmentId?: string;
        pendingPayment?: boolean;
      };
      if (!response.ok) {
        throw new Error(data.error ?? (payOnline ? "No se pudo iniciar el pago" : "No se pudo registrar la inscripción"));
      }
      if (payOnline && data.enrollmentId) {
        window.location.href = `/checkout/modo/${data.enrollmentId}`;
        return;
      }
      setPendingPayment(Boolean(data.pendingPayment));
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-xl bg-gray-800 p-6 shadow-xl" role="status">
        <p className="text-lg font-semibold text-white">¡Listo, ya estás inscripto/a!</p>
        <p className="mt-2 text-gray-400">
          {pendingPayment
            ? `Recibimos tu inscripción a ${course.title}. El pago online se suma más adelante; el equipo de ATDA te va a escribir para confirmarla.`
            : `Registramos tu inscripción a ${course.title}. El equipo de ATDA te va a escribir con los detalles.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-4 rounded-xl bg-gray-800 p-6 shadow-xl">
      <PriceSummary course={course} />
      <Input name="name" label="Nombre y apellido" autoComplete="name" required />
      <Input name="email" type="email" label="Email" autoComplete="email" required />
      <Input
        name="dni"
        label="DNI"
        autoComplete="off"
        inputMode="numeric"
        maxLength={8}
        required
      />
      <Input name="phone" type="tel" label="Teléfono" autoComplete="tel" inputMode="tel" required />
      <div hidden>
        <label>
          Sitio web
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label htmlFor="termsAccepted" className="flex items-start gap-3 text-left text-sm text-gray-300">
        <input
          id="termsAccepted"
          name="termsAccepted"
          type="checkbox"
          required
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-500 bg-gray-900 accent-blue-600"
        />
        <span>
          Leí y acepto los{" "}
          <Link href="/terminos" target="_blank" className="font-medium text-teal-300 underline underline-offset-2">
            términos y condiciones
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" target="_blank" className="font-medium text-teal-300 underline underline-offset-2">
            política de privacidad
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </Link>
          .
        </span>
      </label>
      {payOnline ? (
        <div className="rounded-lg border border-gray-700 p-4 text-left">
          <p className="font-semibold text-white">Pago con MODO</p>
          <p className="mt-1 text-sm text-gray-400">
            Vas a ver un QR (escritorio) o podés abrir la app de tu banco / MODO en el celular. Procesado con Decidir
            Plus (Payway).
          </p>
        </div>
      ) : null}
      {error ? <p className="text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className={buttonClass({ className: "w-full" })}
      >
        {payOnline
          ? status === "submitting"
            ? "Generando QR MODO..."
            : "Pagar con MODO"
          : status === "submitting"
            ? "Registrando..."
            : "Inscribirme"}
      </button>
      {payOnline ? (
        <p className="text-sm text-gray-400">
          El acceso al aula virtual lo asigna un administrador de ATDA después de acreditar el pago. Tenés 10 días para
          arrepentirte desde el{" "}
          <Link href="/arrepentimiento" className="text-teal-300 underline underline-offset-2">
            botón de arrepentimiento
          </Link>
          .
        </p>
      ) : free ? null : (
        <p className="text-sm text-gray-400">
          El pago online se suma más adelante. Con este formulario dejás tu inscripción y ATDA te escribe para
          confirmarla.
        </p>
      )}
    </form>
  );
}

function PriceSummary({ course }: { course: Course }) {
  switch (priceModeOf(course)) {
    case "free":
      return <p className="text-lg text-gray-300">Actividad no arancelada.</p>;
    case "members":
      return (
        <div className="text-gray-300">
          <p className="text-lg">
            Socios: <span className="font-bold text-white">{formatARS(course.memberPrice ?? 0)}</span> · No socios:{" "}
            <span className="font-bold text-white">{formatARS(course.nonMemberPrice ?? 0)}</span>
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Si sos socio/a activo/a, usá el email y DNI con los que te registraste y se aplica el precio de socios.
          </p>
        </div>
      );
    default:
      return (
        <p className="text-lg text-gray-300">
          Importe: <span className="font-bold text-white">{formatARS(course.price ?? 0)}</span>
        </p>
      );
  }
}

function Input({
  name,
  label,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-medium text-gray-300">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        className="w-full rounded-md border border-gray-500 bg-gray-900 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}
