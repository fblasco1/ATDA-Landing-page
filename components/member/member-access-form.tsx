"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function MemberAccessForm({
  mode,
  defaultEmail,
}: {
  mode: "activate" | "recover";
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const endpoint = mode === "activate" ? "/api/socio/activate" : "/api/socio/recover";
  const title = mode === "activate" ? "Activar acceso" : "Recuperar acceso";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "No se pudo completar");
        setBusy(false);
        return;
      }
      setMessage(
        mode === "activate"
          ? "Acceso activado. Ya podés ingresar."
          : "Contraseña actualizada. Ya podés ingresar.",
      );
      setBusy(false);
      setTimeout(() => router.push("/socio/login"), 1200);
    } catch {
      setError("Error de red");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="sr-only">{title}</h2>
      <label className="block text-sm text-gray-400">
        Email de socio
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-gray-400">
        DNI
        <input name="dni" required autoComplete="off" className={inputClass} />
      </label>
      <label className="block text-sm text-gray-400">
        Nueva contraseña
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-gray-400">
        Confirmar contraseña
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-teal-300" role="status">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Guardando…" : title}
      </button>
      <p className="text-center text-sm text-gray-500">
        <Link href="/socio/login" className="text-teal-300 hover:text-teal-200">
          Volver al login
        </Link>
      </p>
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-3 text-white focus:border-blue-500 focus:outline-none";
