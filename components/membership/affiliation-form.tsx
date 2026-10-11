"use client";

import { useState, type FormEvent } from "react";
import { PrivacyConsent } from "@/components/legal/privacy-consent";
import { buttonClass } from "@/components/ui/button";

type Status = "idle" | "submitting" | "success" | "error";

export function AffiliationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/membership/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok) {
        setStatus("error");
        setMessage(result.error ?? "No se pudo enviar la solicitud");
        return;
      }
      setStatus("success");
      setMessage("Recibimos tu solicitud. El equipo de ATDA la va a revisar y te va a contactar.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Error de red. Intentá de nuevo.");
    }
  };

  const disabled = status === "submitting" || status === "success";

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-5 rounded-xl border border-gray-800 bg-gray-900 p-6 md:p-8"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre y apellido" htmlFor="fullName" required>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            required
            disabled={disabled}
            className={inputClass}
          />
        </Field>
        <Field label="Email" htmlFor="email" required>
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
        <Field label="DNI" htmlFor="dni" required>
          <input
            id="dni"
            name="dni"
            inputMode="numeric"
            autoComplete="off"
            required
            disabled={disabled}
            className={inputClass}
          />
        </Field>
        <Field label="Teléfono" htmlFor="phone" required>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            disabled={disabled}
            className={inputClass}
          />
        </Field>
        <Field label="Profesión" htmlFor="profession" required>
          <input
            id="profession"
            name="profession"
            autoComplete="off"
            required
            disabled={disabled}
            className={inputClass}
          />
        </Field>
        <Field label="Organización / empresa (opcional)" htmlFor="organization">
          <input
            id="organization"
            name="organization"
            autoComplete="organization"
            disabled={disabled}
            className={inputClass}
          />
        </Field>
        <Field label="Cargo / rol (opcional)" htmlFor="roleTitle">
          <input
            id="roleTitle"
            name="roleTitle"
            autoComplete="organization-title"
            disabled={disabled}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="¿Por qué querés sumarte a ATDA? (opcional)" htmlFor="motivation">
        <textarea
          id="motivation"
          name="motivation"
          rows={5}
          disabled={disabled}
          className={inputClass}
          placeholder="Contanos tu vínculo con la tecnología, la industria o el desarrollo productivo…"
        />
      </Field>

      <PrivacyConsent disabled={disabled} />

      {/* Honeypot */}
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
        {status === "submitting" ? "Enviando…" : status === "success" ? "Solicitud enviada" : "Enviar solicitud"}
      </button>

      {message ? (
        <p className={status === "success" ? "text-teal-300" : "text-red-400"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1 block text-sm text-gray-400">
        {label}
        {required ? <span className="text-teal-400"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-gray-500 bg-gray-950 p-3 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none disabled:opacity-60";
