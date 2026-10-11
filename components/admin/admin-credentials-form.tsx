"use client";

import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

export function AdminCredentialsForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("admin", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });
    if (!result || result.error) {
      setError("Email o contraseña incorrectos.");
      setBusy(false);
      return;
    }
    // Navegación completa: el proxy decide entre /admin y /admin/cambiar-clave.
    window.location.assign("/admin");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-left">
      <label className="block text-sm text-gray-400">
        Email
        <input name="email" type="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className="block text-sm text-gray-400">
        Contraseña
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-3 text-white focus:border-blue-500 focus:outline-none";
