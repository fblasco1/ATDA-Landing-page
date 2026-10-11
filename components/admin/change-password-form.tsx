"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const { update } = useSession();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "No se pudo cambiar la contraseña");
        setBusy(false);
        return;
      }
      setSaved(true);
      // Sin argumentos `update()` solo relee la sesión y el token sigue pidiendo cambiar la contraseña.
      const session = await update({ passwordChanged: true });
      if (session && !session.user?.mustChangePassword) {
        window.location.assign("/admin");
      } else {
        await signOut({ callbackUrl: "/admin/login" });
      }
    } catch {
      setError("Error de red. Intentá de nuevo.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      <label className="block text-sm text-gray-400">
        Contraseña actual {forced ? "(la temporal que recibiste)" : null}
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-gray-400">
        Contraseña nueva (mínimo 10 caracteres)
        <input
          name="newPassword"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-gray-400">
        Repetir contraseña nueva
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-teal-300" role="status">
          Contraseña actualizada. Te llevamos al panel…
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {saved ? "Contraseña guardada" : busy ? "Guardando…" : "Guardar contraseña"}
      </button>
      {forced ? (
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full text-sm text-gray-500 hover:text-gray-300"
        >
          Salir
        </button>
      ) : null}
    </form>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-gray-700 bg-gray-950 p-3 text-white focus:border-blue-500 focus:outline-none";
