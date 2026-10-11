"use client";

import { useState, type FormEvent } from "react";
import type { Member } from "@/lib/db/schema";

export function NewMemberForm({
  onCreated,
}: {
  onCreated: (member: Member, email: { sent: boolean; error?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      member?: Member;
      emailSent?: boolean;
      emailError?: string;
    };
    setBusy(false);
    if (!response.ok || !data.member) {
      setError(data.error ?? "No se pudo crear el socio");
      return;
    }
    onCreated(data.member, { sent: Boolean(data.emailSent), error: data.emailError });
    setFormKey((key) => key + 1);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        + Nuevo socio
      </button>
    );
  }

  return (
    <form
      key={formKey}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4"
    >
      <h3 className="font-semibold text-white">Nuevo socio</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="fullName" label="Nombre y apellido" required />
        <Input name="email" label="Email" type="email" required />
        <Input name="dni" label="DNI" required />
        <Input name="phone" label="Teléfono" type="tel" />
        <Input name="profession" label="Profesión" />
        <Input name="organization" label="Organización / empresa" />
        <Input name="roleTitle" label="Cargo / rol" />
        <label className="text-sm text-gray-400">
          Estado
          <select
            name="status"
            defaultValue="active"
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-2 text-white"
          >
            <option value="active">Activo</option>
            <option value="suspended">Suspendido</option>
            <option value="inactive">Inactivo</option>
          </select>
        </label>
        <label className="text-sm text-gray-400 md:col-span-2">
          Notas
          <textarea
            name="notes"
            rows={2}
            className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-2 text-white"
          />
        </label>
      </div>
      <p className="text-xs text-gray-500">
        Le enviamos un mail con el link para activar su acceso al portal (pide este email y DNI).
      </p>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? "Creando…" : "Crear socio"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Input({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm text-gray-400">
      {label}
      {required ? <span className="text-teal-400"> *</span> : null}
      <input
        name={name}
        type={type}
        required={required}
        autoComplete="off"
        className="mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-2 text-white"
      />
    </label>
  );
}
