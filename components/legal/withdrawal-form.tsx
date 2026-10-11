"use client";

import { useState, type FormEvent } from "react";
import { buttonClass } from "@/components/ui/button";

const inputClass =
  "w-full rounded-md border border-gray-500 bg-gray-950 p-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none disabled:opacity-60";

export function WithdrawalForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/arrepentimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { code?: string; error?: string };
      if (!response.ok) {
        setStatus("error");
        setError(result.error ?? "No se pudo registrar el pedido.");
        return;
      }
      setCode(result.code ?? "");
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Error de red. Intentá de nuevo.");
    }
  };

  if (status === "done") {
    return (
      <div role="status" className="rounded-xl border border-teal-700/60 bg-teal-950/40 p-6 text-center">
        <p className="text-lg font-semibold text-white">Recibimos tu pedido</p>
        {code ? (
          <>
            <p className="mt-4 text-gray-300">Tu código de seguimiento es</p>
            <p className="mt-2 text-3xl font-bold tracking-widest text-teal-300">{code}</p>
          </>
        ) : null}
        <p className="mt-4 text-gray-300">
          También te lo enviamos por email. El equipo de ATDA va a procesar la devolución por el mismo medio de pago.
        </p>
      </div>
    );
  }

  const disabled = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre y apellido" htmlFor="fullName">
          <input id="fullName" name="fullName" autoComplete="name" required disabled={disabled} className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={disabled}
            className={inputClass}
          />
        </Field>
        <Field label="DNI" htmlFor="dni">
          <input id="dni" name="dni" inputMode="numeric" required disabled={disabled} className={inputClass} />
        </Field>
        <Field label="Curso o actividad" htmlFor="purchase">
          <input
            id="purchase"
            name="purchase"
            required
            disabled={disabled}
            placeholder="Ej.: Curso de Industria 4.0"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Comentarios (opcional)" htmlFor="details" optional>
        <textarea
          id="details"
          name="details"
          rows={4}
          disabled={disabled}
          placeholder="Fecha de pago, número de operación u otro dato que nos ayude a encontrar la compra."
          className={inputClass}
        />
      </Field>
      <div hidden>
        <label>
          Sitio web
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button
        type="submit"
        disabled={disabled}
        className={buttonClass({ className: "w-full md:w-auto" })}
      >
        {disabled ? "Enviando…" : "Revocar la contratación"}
      </button>
      {error ? (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm text-gray-300">
        {label}
        {optional ? null : <span className="text-teal-400"> *</span>}
      </label>
      {children}
    </div>
  );
}
