"use client";

import { useRef, useState } from "react";
import { HeroImagesInput } from "@/components/admin/hero-images-input";
import { IconPicker } from "@/components/admin/icon-picker";
import { heroImages } from "@/components/landing/hero";
import { DEFAULT_PRIVACY_POLICY, PRIVACY_PLACEHOLDERS } from "@/lib/legal/privacy";
import type { LandingSettings } from "@/lib/sanity/types";

const SECTION_FIELDS = [
  "navAboutLabel",
  "navNewsLabel",
  "navNetworkLabel",
  "navCoursesLabel",
  "navContactLabel",
  "navJoinLabel",
  "newsTitle",
  "newsSubtitle",
  "networkTitle",
  "networkSubtitle",
  "coursesTitle",
  "coursesSubtitle",
  "membershipTitle",
  "membershipSubtitle",
] as const satisfies readonly (keyof LandingSettings)[];

type SectionField = (typeof SECTION_FIELDS)[number];

function SectionTitleFields({
  heading,
  titleName,
  subtitleName,
  initial,
}: {
  heading: string;
  titleName: SectionField;
  subtitleName: SectionField;
  initial: LandingSettings;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-800/80 p-3">
      <p className="text-sm font-semibold text-gray-200">{heading}</p>
      <AdminInput name={titleName} label="Título" defaultValue={initial[titleName]} />
      <AdminTextarea name={subtitleName} label="Bajada" defaultValue={initial[subtitleName]} rows={2} />
    </div>
  );
}

function buildPayload(form: FormData) {
  const aboutValues = [0, 1, 2, 3].map((index) => ({
    icon: String(form.get(`valueIcon${index}`) ?? "collaboration"),
    title: String(form.get(`valueTitle${index}`) ?? ""),
    description: String(form.get(`valueDescription${index}`) ?? ""),
  }));
  const heroImageUrls = JSON.parse(String(form.get("heroImageUrls") ?? "[]")) as string[];
  const sectionFields = Object.fromEntries(SECTION_FIELDS.map((key) => [key, form.get(key)]));
  return {
    ...sectionFields,
    heroTitle: form.get("heroTitle"),
    heroSubtitle: form.get("heroSubtitle"),
    heroImageUrls,
    heroImageUrl: heroImageUrls[0] ?? "",
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
    legalName: form.get("legalName"),
    legalCuit: form.get("legalCuit"),
    legalRegistration: form.get("legalRegistration"),
    legalAddress: form.get("legalAddress"),
    privacyEmail: form.get("privacyEmail"),
    privacyPolicy: form.get("privacyPolicy"),
  };
}

function PrivacyPolicyInput({ defaultValue, onChange }: { defaultValue: string; onChange: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="space-y-2">
      <label className="block">
        <span className="mb-1 block text-sm text-gray-400">Texto de la política de privacidad</span>
        <textarea
          ref={ref}
          name="privacyPolicy"
          defaultValue={defaultValue}
          rows={12}
          placeholder="Vacío: se publica el texto base con los datos institucionales de arriba."
          className="w-full rounded-md border border-gray-700 bg-gray-900 p-2 font-mono text-sm text-white"
        />
      </label>
      <p className="text-xs text-gray-400">
        Formato: una línea que empieza con <code>## </code> es un título, con <code>- </code> es un ítem de lista y el
        resto son párrafos. Podés usar {PRIVACY_PLACEHOLDERS.join(", ")} para insertar los datos institucionales.
      </p>
      <button
        type="button"
        onClick={() => {
          if (!ref.current) return;
          if (ref.current.value.trim() && !window.confirm("¿Reemplazar el texto actual por el texto base?")) return;
          ref.current.value = DEFAULT_PRIVACY_POLICY;
          onChange();
        }}
        className="rounded-md border border-gray-600 px-3 py-1.5 text-sm text-gray-200 hover:border-gray-400 hover:text-white"
      >
        Cargar el texto base para editarlo
      </button>
    </div>
  );
}

export function SettingsForm({ initial }: { initial: LandingSettings }) {
  const [status, setStatus] = useState<"" | "saved" | "error">("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewBlocked, setPreviewBlocked] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    const payload = buildPayload(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setStatus(response.ok ? "saved" : "error");
    if (response.ok) setDirty(false);
  };

  const handlePreview = async () => {
    if (!formRef.current) return;
    // La pestaña se abre antes del fetch para que el navegador no la bloquee como popup.
    const tab = window.open("about:blank", "_blank");
    setPreviewing(true);
    setPreviewError("");
    setPreviewBlocked(false);
    const response = await fetch("/api/admin/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(new FormData(formRef.current))),
    }).catch(() => null);
    const data = (await response?.json().catch(() => ({}))) as { url?: string; error?: string } | undefined;
    setPreviewing(false);
    if (response?.ok && data?.url) {
      if (tab) tab.location.href = data.url;
      else setPreviewBlocked(true);
    } else {
      tab?.close();
      setPreviewError(data?.error ?? "No se pudo abrir la vista previa");
    }
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
      ref={formRef}
      onSubmit={handleSubmit}
      onChange={() => {
        setDirty(true);
        setStatus("");
        setPreviewError("");
      }}
      className="space-y-8"
    >
      <fieldset className="space-y-3 rounded-lg border border-gray-800 p-4">
        <legend className="px-2 text-lg font-semibold text-white">Hero</legend>
        <AdminInput name="heroTitle" label="Título" defaultValue={initial.heroTitle} />
        <AdminTextarea name="heroSubtitle" label="Subtítulo" defaultValue={initial.heroSubtitle} />
        <HeroImagesInput
          name="heroImageUrls"
          initial={heroImages(initial)}
          onChange={() => {
            setDirty(true);
            setStatus("");
          }}
        />
      </fieldset>
      <fieldset className="space-y-4 rounded-lg border border-gray-800 p-4">
        <legend className="px-2 text-lg font-semibold text-white">Nombres de secciones y menú</legend>
        <p className="text-sm text-gray-400">
          Cambiar un nombre no rompe los enlaces: las direcciones de las páginas siguen siendo las mismas. Si dejás un
          nombre vacío se usa el original.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <AdminInput name="navAboutLabel" label="Menú: Sobre nosotros" defaultValue={initial.navAboutLabel} />
          <AdminInput name="navNewsLabel" label="Menú: Novedades" defaultValue={initial.navNewsLabel} />
          <AdminInput name="navNetworkLabel" label="Menú: Red" defaultValue={initial.navNetworkLabel} />
          <AdminInput name="navCoursesLabel" label="Menú: Propuestas" defaultValue={initial.navCoursesLabel} />
          <AdminInput name="navContactLabel" label="Menú: Contacto" defaultValue={initial.navContactLabel} />
          <AdminInput name="navJoinLabel" label="Botón: Quiero ser parte" defaultValue={initial.navJoinLabel} />
        </div>
        <SectionTitleFields
          heading="Novedades (sección y página /novedades)"
          titleName="newsTitle"
          subtitleName="newsSubtitle"
          initial={initial}
        />
        <SectionTitleFields
          heading="Red"
          titleName="networkTitle"
          subtitleName="networkSubtitle"
          initial={initial}
        />
        <SectionTitleFields
          heading="Propuestas (sección y página /propuestas)"
          titleName="coursesTitle"
          subtitleName="coursesSubtitle"
          initial={initial}
        />
        <SectionTitleFields
          heading="Página de asociación (/asociacion)"
          titleName="membershipTitle"
          subtitleName="membershipSubtitle"
          initial={initial}
        />
        <p className="text-xs text-gray-500">
          Los títulos de Quiénes somos, Sumate y Contacto se editan en sus propias secciones más abajo.
        </p>
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
      <fieldset className="space-y-3 rounded-lg border border-gray-800 p-4">
        <legend className="px-2 text-lg font-semibold text-white">Datos institucionales y privacidad</legend>
        <p className="text-sm text-gray-400">
          Se muestran en el footer y en la página <code>/privacidad</code>. Usá la razón social exacta del estatuto.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <AdminInput name="legalName" label="Razón social" defaultValue={initial.legalName} />
          <AdminInput name="legalCuit" label="CUIT" defaultValue={initial.legalCuit} />
          <AdminInput
            name="legalRegistration"
            label="Inscripción (ej.: IGJ Resolución N.º …)"
            defaultValue={initial.legalRegistration}
          />
          <AdminInput name="legalAddress" label="Domicilio legal" defaultValue={initial.legalAddress} />
          <AdminInput
            name="privacyEmail"
            label="Email para pedidos sobre datos personales"
            defaultValue={initial.privacyEmail}
          />
        </div>
        <PrivacyPolicyInput
          defaultValue={initial.privacyPolicy}
          onChange={() => {
            setDirty(true);
            setStatus("");
          }}
        />
      </fieldset>
      <div className="sticky bottom-0 -mx-2 flex flex-wrap items-center gap-4 border-t border-gray-800 bg-gray-950/95 px-2 py-4 backdrop-blur">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {saving ? "Guardando..." : "Guardar contenido"}
        </button>
        <button
          type="button"
          onClick={handlePreview}
          disabled={previewing || saving}
          className="rounded-lg border border-gray-600 px-5 py-3 font-semibold text-gray-200 hover:border-gray-400 hover:text-white disabled:opacity-70"
        >
          {previewing ? "Preparando..." : "Vista previa"}
        </button>
        <p role="status" className="text-sm">
          {previewError ? (
            <span className="text-red-400">{previewError}</span>
          ) : previewBlocked ? (
            <a
              href="/"
              target="_blank"
              rel="noopener"
              onClick={() => setPreviewBlocked(false)}
              className="text-teal-300 underline hover:text-teal-200"
            >
              Vista previa lista: abrir el sitio
            </a>
          ) : saving ? null : dirty ? (
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
