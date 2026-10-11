"use client";

import Link from "next/link";
import { cloneElement, useState } from "react";
import { PrivacyConsent } from "@/components/legal/privacy-consent";
import type { LandingSettings } from "@/lib/sanity/types";
import { sectionBandClass, sectionCardClass, type SectionBand } from "./section-band";
import { buttonClass } from "@/components/ui/button";

export function Contact({
  settings,
  band = "alt",
}: {
  settings: LandingSettings;
  band?: SectionBand;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    _subject: "",
    message: "",
    website: "",
  });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (formData.name.trim().length < 2) errors.name = "Ingresá tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Email inválido.";
    }
    const phone = formData.phone.trim();
    if (phone && phone.replace(/\D/g, "").length < 6) errors.phone = "Ingresá un teléfono válido o dejalo vacío.";
    if (!formData._subject) errors._subject = "Elegí un tema.";
    if (formData.message.trim().length < 10) {
      errors.message = "El mensaje debe tener al menos 10 caracteres.";
    }
    if (!privacyAccepted) errors.privacyAccepted = "Tenés que aceptar la política de privacidad.";
    setFieldErrors(errors);
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.website) {
      setStatus("success");
      return;
    }
    const errors = validate();
    const firstInvalid = FIELD_ORDER.find((key) => errors[key]);
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid] ?? firstInvalid)?.focus();
      return;
    }
    if (!settings.formspreeEndpoint) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const { website: _honeypot, ...payload } = formData;
      const response = await fetch(settings.formspreeEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, privacyAccepted: "Sí" }),
      });
      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", _subject: "", message: "", website: "" });
        setPrivacyAccepted(false);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const disabled = status === "submitting" || status === "success";
  const errorCount = Object.keys(fieldErrors).length;

  return (
    <section id="contact" className={`${sectionBandClass(band)} py-20`}>
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">{settings.contactTitle}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">{settings.contactSubtitle}</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400">
            ¿Querés asociarte?{" "}
            <Link href="/asociacion" className="font-medium text-teal-300 hover:text-teal-200">
              Completá la solicitud de asociación
            </Link>
            .
          </p>
        </div>
        <div className={`relative mx-auto max-w-4xl rounded-lg ${sectionCardClass(band)} p-8 shadow-xl`}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="Nombre" htmlFor="name" error={fieldErrors.name}>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  disabled={disabled}
                  aria-invalid={Boolean(fieldErrors.name)}
                  className={inputClass}
                />
              </Field>
              <Field label="Email" htmlFor="email" error={fieldErrors.email}>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  disabled={disabled}
                  aria-invalid={Boolean(fieldErrors.email)}
                  className={inputClass}
                />
              </Field>
              <Field label="Teléfono (opcional)" htmlFor="phone" error={fieldErrors.phone}>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  disabled={disabled}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  className={inputClass}
                />
              </Field>
              <Field label="Tema del contacto" htmlFor="subject" error={fieldErrors._subject}>
                <select
                  id="subject"
                  name="_subject"
                  value={formData._subject}
                  onChange={handleChange}
                  required
                  disabled={disabled}
                  aria-invalid={Boolean(fieldErrors._subject)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Seleccioná un tema...
                  </option>
                  <option value="Consulta">Consulta</option>
                  <option value="Propuesta">Propuesta</option>
                  <option value="Cursos y actividades">Cursos y actividades</option>
                  <option value="Otro">Otro</option>
                </select>
              </Field>
            </div>
            <div className="mb-6">
              <Field label="Mensaje" htmlFor="message" error={fieldErrors.message}>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                  disabled={disabled}
                  aria-invalid={Boolean(fieldErrors.message)}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mb-6">
              <PrivacyConsent
                checked={privacyAccepted}
                disabled={disabled}
                error={fieldErrors.privacyAccepted}
                onChange={(checked) => {
                  setPrivacyAccepted(checked);
                  setFieldErrors(({ privacyAccepted: _removed, ...rest }) => rest);
                }}
              />
            </div>

            <div hidden>
              <label>
                Sitio web
                <input
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="flex min-h-20 items-center justify-center text-center">
              {status === "success" ? (
                <div className="flex flex-col items-center">
                  <div className="mb-1 rounded-full bg-green-500/20 p-2">
                    <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-green-400">¡Enviado! Te vamos a contactar</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className={buttonClass({ size: "lg" })}
                >
                  {status === "submitting" ? "Enviando..." : "Enviar mensaje"}
                </button>
              )}
            </div>
            <div role="alert" className="mt-4 text-center text-red-400">
              {errorCount > 0 ? (
                <p>
                  {errorCount === 1 ? "Revisá el campo marcado." : `Revisá los ${errorCount} campos marcados.`}
                </p>
              ) : status === "error" ? (
                <p>No se pudo enviar el mensaje. Revisá los datos o intentá más tarde.</p>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

const FIELD_ORDER = ["name", "email", "phone", "_subject", "message", "privacyAccepted"];
const FIELD_IDS: Record<string, string> = { _subject: "subject" };

const inputClass =
  "w-full rounded-md border border-gray-500 bg-gray-900 p-3 text-white placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactElement<{ "aria-describedby"?: string }>;
}) {
  const errorId = `${htmlFor}-error`;
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block font-medium text-gray-300">
        {label}
      </label>
      {cloneElement(children, { "aria-describedby": error ? errorId : undefined })}
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
