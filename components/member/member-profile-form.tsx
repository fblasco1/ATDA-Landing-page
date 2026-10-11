"use client";

import { useState, type FormEvent } from "react";

type Profile = {
  phone: string | null;
  profession: string | null;
  organization: string | null;
  roleTitle: string | null;
};

export function MemberProfileForm({ initial }: { initial: Profile }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/socio/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setStatus("error");
      setError(data.error ?? "No se pudo guardar");
      return;
    }
    setDirty(false);
    setStatus("saved");
  };

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => {
        setDirty(true);
        if (status !== "saving") setStatus("idle");
      }}
      className="mt-6 space-y-4 border-t border-gray-800 pt-6"
    >
      <p className="text-sm text-gray-400">Podés actualizar estos datos cuando cambien.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Teléfono" name="phone" type="tel" autoComplete="tel" defaultValue={initial.phone} required />
        <Field label="Profesión" name="profession" defaultValue={initial.profession} required />
        <Field
          label="Organización / empresa"
          name="organization"
          autoComplete="organization"
          defaultValue={initial.organization}
        />
        <Field
          label="Cargo / rol"
          name="roleTitle"
          autoComplete="organization-title"
          defaultValue={initial.roleTitle}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "saving" || !dirty}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {status === "saving" ? "Guardando…" : "Guardar cambios"}
        </button>
        <p role="status" className="text-sm">
          {dirty && status === "idle" ? <span className="text-amber-300">Tenés cambios sin guardar</span> : null}
          {status === "saved" ? <span className="text-teal-300">Datos actualizados</span> : null}
          {status === "error" ? <span className="text-red-400">{error}</span> : null}
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete = "off",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue: string | null;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-500">
        {label}
        {required ? <span className="text-teal-400"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="w-full rounded-md border border-gray-700 bg-gray-950 p-2 text-white focus:border-blue-500 focus:outline-none"
      />
    </label>
  );
}
