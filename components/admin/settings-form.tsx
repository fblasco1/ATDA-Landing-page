"use client";

import { useState } from "react";
import { IconPicker } from "@/components/admin/icon-picker";
import type { LandingSettings } from "@/lib/sanity/types";

export function SettingsForm({ initial }: { initial: LandingSettings }) {
  const [status, setStatus] = useState<"" | "saved" | "error">("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const aboutValues = [0, 1, 2, 3].map((index) => ({
      icon: String(form.get(`valueIcon${index}`) ?? "collaboration"),
      title: String(form.get(`valueTitle${index}`) ?? ""),
      description: String(form.get(`valueDescription${index}`) ?? ""),
    }));
    const payload = {
      heroTitle: form.get("heroTitle"),
      heroSubtitle: form.get("heroSubtitle"),
      heroImageUrl: form.get("heroImageUrl"),
      aboutTitle: form.get("aboutTitle"),
      aboutBody: form.get("aboutBody"),
      aboutValues,
      joinTitle: form.get("joinTitle"),
      joinSubtitle: form.get("joinSubtitle"),
      joinBenefits: String(form.get("joinBenefits") ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      joinEligibility: [0, 1, 2].map((index) => ({
        title: String(form.get(`eligTitle${index}`) ?? ""),
        description: String(form.get(`eligDescription${index}`) ?? ""),
      })),
      joinCtaText: form.get("joinCtaText"),
      joinCtaLabel: form.get("joinCtaLabel"),
      contactTitle: form.get("contactTitle"),
      contactSubtitle: form.get("contactSubtitle"),
      formspreeEndpoint: form.get("formspreeEndpoint"),
      footerText: form.get("footerText"),
      socialTwitter: form.get("socialTwitter"),
      socialInstagram: form.get("socialInstagram"),
      socialLinkedin: form.get("socialLinkedin"),
      contactEmail: form.get("contactEmail"),
      statuteUrl: form.get("statuteUrl"),
    };

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setStatus(response.ok ? "saved" : "error");
    if (response.ok) setDirty(false);
  };

  const aboutValues =
    initial.aboutValues.length >= 4
      ? initial.aboutValues
      : [
          ...initial.aboutValues,
          ...Array.from({ length: Math.max(0, 4 - initial.aboutValues.length) }, () => ({
            icon: "collaboration",
            title: "",
            description: "",
          })),
        ];

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => {
        setDirty(true);
        setStatus("");
      }}
      className="space-y-8"
    >
      <fieldset className="space-y-3 rounded-lg border border-gray-800 p-4">
        <legend className="px-2 text-lg font-semibold text-white">Hero</legend>
        <AdminInput name="heroTitle" label="Título" defaultValue={initial.heroTitle} />
        <AdminTextarea name="heroSubtitle" label="Subtítulo" defaultValue={initial.heroSubtitle} />
        <AdminInput name="heroImageUrl" label="URL de imagen" defaultValue={initial.heroImageUrl ?? ""} />
      </fieldset>
      <fieldset className="space-y-3 rounded-lg border border-gray-800 p-4">
        <legend className="px-2 text-lg font-semibold text-white">Quiénes somos</legend>
        <AdminInput name="aboutTitle" label="Título" defaultValue={initial.aboutTitle} />
        <AdminTextarea name="aboutBody" label="Texto" defaultValue={initial.aboutBody} rows={5} />
        {aboutValues.slice(0, 4).map((value, index) => (
          <div key={`value-${index}`} className="grid gap-3 rounded-lg border border-gray-800/80 p-3 md:grid-cols-3">
            <IconPicker name={`valueIcon${index}`} label="Ícono" defaultValue={value.icon} />
            <AdminInput name={`valueTitle${index}`} label="Título valor" defaultValue={value.title} />
            <AdminInput name={`valueDescription${index}`} label="Descripción" defaultValue={value.description} />
          </div>
        ))}
      </fieldset>
      <fieldset className="space-y-3 rounded-lg border border-gray-800 p-4">
        <legend className="px-2 text-lg font-semibold text-white">Sumate</legend>
        <AdminInput name="joinTitle" label="Título" defaultValue={initial.joinTitle} />
        <AdminTextarea name="joinSubtitle" label="Subtítulo" defaultValue={initial.joinSubtitle} />
        <AdminTextarea
          name="joinBenefits"
          label="Beneficios (uno por línea)"
          defaultValue={initial.joinBenefits.join("\n")}
          rows={5}
        />
        {initial.joinEligibility.map((item, index) => (
          <div key={item.title} className="grid gap-3 md:grid-cols-2">
            <AdminInput name={`eligTitle${index}`} label="Quién" defaultValue={item.title} />
            <AdminInput name={`eligDescription${index}`} label="Descripción" defaultValue={item.description} />
          </div>
        ))}
        <AdminTextarea name="joinCtaText" label="Texto CTA" defaultValue={initial.joinCtaText} />
        <AdminInput name="joinCtaLabel" label="Botón CTA" defaultValue={initial.joinCtaLabel} />
      </fieldset>
      <fieldset className="space-y-3 rounded-lg border border-gray-800 p-4">
        <legend className="px-2 text-lg font-semibold text-white">Contacto y footer</legend>
        <AdminInput name="contactTitle" label="Título contacto" defaultValue={initial.contactTitle} />
        <AdminTextarea name="contactSubtitle" label="Subtítulo contacto" defaultValue={initial.contactSubtitle} />
        <AdminInput name="formspreeEndpoint" label="Endpoint Formspree" defaultValue={initial.formspreeEndpoint} />
        <AdminInput name="footerText" label="Texto footer" defaultValue={initial.footerText} />
        <AdminInput name="socialTwitter" label="X / Twitter" defaultValue={initial.socialTwitter ?? ""} />
        <AdminInput name="socialInstagram" label="Instagram" defaultValue={initial.socialInstagram ?? ""} />
        <AdminInput name="socialLinkedin" label="LinkedIn" defaultValue={initial.socialLinkedin ?? ""} />
        <AdminInput name="contactEmail" label="Email (mailto:)" defaultValue={initial.contactEmail ?? ""} />
        <AdminInput name="statuteUrl" label="Estatuto" defaultValue={initial.statuteUrl ?? ""} />
      </fieldset>
      <div className="sticky bottom-0 -mx-2 flex flex-wrap items-center gap-4 border-t border-gray-800 bg-gray-950/95 px-2 py-4 backdrop-blur">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {saving ? "Guardando..." : "Guardar contenido"}
        </button>
        <p role="status" className="text-sm">
          {saving ? null : dirty ? (
            <span className="text-amber-300">Tenés cambios sin guardar</span>
          ) : status === "saved" ? (
            <span className="text-teal-300">Guardado. Ya se ve en el sitio.</span>
          ) : status === "error" ? (
            <span className="text-red-400">No se pudo guardar</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}

function AdminInput({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-gray-400">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
      />
    </label>
  );
}

function AdminTextarea({
  name,
  label,
  defaultValue,
  rows = 3,
}: {
  name: string;
  label: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-gray-400">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
      />
    </label>
  );
}
